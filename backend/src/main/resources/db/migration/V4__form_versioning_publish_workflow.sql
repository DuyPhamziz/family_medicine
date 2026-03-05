CREATE TABLE IF NOT EXISTS form_versions (
    version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    form_schema_json TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP,
    change_log TEXT,
    scoring_rules_json TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_form_versions_form FOREIGN KEY (form_id) REFERENCES diagnostic_forms(form_id) ON DELETE CASCADE,
    CONSTRAINT ck_form_versions_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'DEPRECATED'))
);

ALTER TABLE form_versions
    ADD COLUMN IF NOT EXISTS version_id UUID,
    ADD COLUMN IF NOT EXISTS form_id UUID,
    ADD COLUMN IF NOT EXISTS version_number INTEGER,
    ADD COLUMN IF NOT EXISTS form_schema_json TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS change_log TEXT,
    ADD COLUMN IF NOT EXISTS scoring_rules_json TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS published_version_id UUID;

ALTER TABLE patient_form_submissions
    ADD COLUMN IF NOT EXISTS form_version_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS uq_form_versions_form_version
    ON form_versions(form_id, version_number);

CREATE INDEX IF NOT EXISTS idx_form_versions_form_status
    ON form_versions(form_id, status, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_diagnostic_forms_published_version
    ON diagnostic_forms(published_version_id);

ALTER TABLE diagnostic_forms
    DROP CONSTRAINT IF EXISTS fk_diagnostic_forms_published_version;

ALTER TABLE diagnostic_forms
    ADD CONSTRAINT fk_diagnostic_forms_published_version
    FOREIGN KEY (published_version_id) REFERENCES form_versions(version_id);

ALTER TABLE patient_form_submissions
    DROP CONSTRAINT IF EXISTS fk_patient_form_submissions_form_version;

ALTER TABLE patient_form_submissions
    ADD CONSTRAINT fk_patient_form_submissions_form_version
    FOREIGN KEY (form_version_id) REFERENCES form_versions(version_id);

WITH forms_without_versions AS (
    SELECT df.form_id, df.form_name, df.description, df.category, df.estimated_time, df.icon_color, df.scoring_rules
    FROM diagnostic_forms df
    WHERE NOT EXISTS (
        SELECT 1 FROM form_versions fv WHERE fv.form_id = df.form_id
    )
),
seed_versions AS (
    INSERT INTO form_versions (
        version_id,
        form_id,
        version_number,
        form_schema_json,
        status,
        published_at,
        change_log,
        scoring_rules_json,
        is_active,
        created_at,
        updated_at
    )
    SELECT
        gen_random_uuid(),
        f.form_id,
        1,
        jsonb_build_object(
            'schemaVersion', '1.0',
            'title', f.form_name,
            'description', f.description,
            'category', f.category,
            'version', 1,
            'sections', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'sectionId', s.section_id,
                        'sectionName', s.section_name,
                        'sectionOrder', s.section_order,
                        'questions', COALESCE((
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'questionId', q.question_id,
                                    'questionCode', q.question_code,
                                    'questionText', q.question_text,
                                    'questionType', q.question_type,
                                    'required', q.required,
                                    'helpText', q.help_text,
                                    'minValue', q.min_value,
                                    'maxValue', q.max_value,
                                    'unit', q.unit,
                                    'displayCondition', q.display_condition,
                                    'formulaExpression', q.formula_expression,
                                    'options', COALESCE((
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                'text', o.option_text,
                                                'label', o.option_text,
                                                'value', COALESCE(o.option_value, o.option_text),
                                                'orderIndex', o.option_order
                                            ) ORDER BY o.option_order ASC NULLS LAST
                                        )
                                        FROM form_question_options o
                                        WHERE o.question_id = q.question_id
                                    ), '[]'::jsonb)
                                ) ORDER BY q.question_order ASC NULLS LAST
                            )
                            FROM form_questions q
                            WHERE q.section_id = s.section_id
                        ), '[]'::jsonb)
                    ) ORDER BY s.section_order ASC NULLS LAST
                )
                FROM form_sections s
                WHERE s.form_id = f.form_id
            ), '[]'::jsonb)
        )::text,
        'PUBLISHED',
        CURRENT_TIMESTAMP,
        'Initial migration snapshot from legacy doctor form',
        f.scoring_rules,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    FROM forms_without_versions f
    RETURNING version_id, form_id
)
UPDATE diagnostic_forms df
SET
    status = CASE WHEN df.status = 'INACTIVE' THEN df.status ELSE 'PUBLISHED' END,
    published_version_id = sv.version_id,
    version = GREATEST(COALESCE(df.version, 1), 1),
    is_public = COALESCE(df.is_public, FALSE),
    public_token = COALESCE(df.public_token, gen_random_uuid())
FROM seed_versions sv
WHERE df.form_id = sv.form_id;

UPDATE patient_form_submissions s
SET form_version_id = df.published_version_id,
    form_version_number = COALESCE(s.form_version_number, 1)
FROM diagnostic_forms df
WHERE s.form_id = df.form_id
  AND s.form_version_id IS NULL
  AND df.published_version_id IS NOT NULL;