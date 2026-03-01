CREATE TABLE IF NOT EXISTS guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT,
    category VARCHAR(255),
    status VARCHAR(255),
    owner VARCHAR(255),
    form_id UUID,
    recommendations TEXT,
    reference_list TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_guideline_form FOREIGN KEY (form_id) REFERENCES diagnostic_forms(form_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_guideline_form_id ON guidelines(form_id);
CREATE INDEX IF NOT EXISTS idx_guideline_category ON guidelines(category);
CREATE INDEX IF NOT EXISTS idx_guideline_updated ON guidelines(updated_at);

CREATE TABLE IF NOT EXISTS logic_variables (
    variable_id UUID PRIMARY KEY,
    variable_name VARCHAR(255) NOT NULL,
    variable_code VARCHAR(255),
    unit VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logic_formulas (
    formula_id UUID PRIMARY KEY,
    formula_name VARCHAR(255) NOT NULL,
    formula_code VARCHAR(255),
    expression TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patient_form_submissions (
    submission_id UUID PRIMARY KEY,
    patient_id UUID,
    form_id UUID NOT NULL,
    doctor_id UUID,
    submission_data TEXT,
    form_snapshot JSONB,
    patient_name VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    total_score DOUBLE PRECISION,
    diagnostic_result TEXT,
    risk_level VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    doctor_response TEXT,
    response_method VARCHAR(20),
    form_version_number INTEGER,
    responded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submission_answers (
    answer_id UUID PRIMARY KEY,
    submission_id UUID NOT NULL,
    question_id UUID,
    question_code VARCHAR(255),
    value TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submission_answers_submission ON submission_answers(submission_id);

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS public_token UUID UNIQUE;

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS estimated_time INTEGER,
    ADD COLUMN IF NOT EXISTS icon_color VARCHAR(64);

ALTER TABLE patient_form_submissions
    ADD COLUMN IF NOT EXISTS form_snapshot JSONB,
    ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(255),
    ADD COLUMN IF NOT EXISTS email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doctor_response TEXT,
    ADD COLUMN IF NOT EXISTS response_method VARCHAR(20),
    ADD COLUMN IF NOT EXISTS form_version_number INTEGER,
    ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

ALTER TABLE patient_form_submissions
    ALTER COLUMN patient_id DROP NOT NULL,
    ALTER COLUMN doctor_id DROP NOT NULL;

ALTER TABLE diagnostic_forms
    DROP CONSTRAINT IF EXISTS diagnostic_forms_status_check;

ALTER TABLE diagnostic_forms
    ADD CONSTRAINT diagnostic_forms_status_check
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'ARCHIVED'));

ALTER TABLE patient_form_submissions
    DROP CONSTRAINT IF EXISTS patient_form_submissions_status_check;

ALTER TABLE patient_form_submissions
    ADD CONSTRAINT patient_form_submissions_status_check
    CHECK (status IN ('DRAFT', 'COMPLETED', 'PENDING', 'REVIEWED', 'RESPONDED'));

ALTER TABLE submission_answers
    DROP CONSTRAINT IF EXISTS fk_submission_answers_submission;

ALTER TABLE submission_answers
    ADD CONSTRAINT fk_submission_answers_submission
    FOREIGN KEY (submission_id) REFERENCES patient_form_submissions(submission_id);


-- Constraints are handled by Hibernate (spring.jpa.hibernate.ddl-auto=update).
-- Explicit ALTER TABLE statements in schema.sql are removed to avoid conflicts with existing legacy constraints.
