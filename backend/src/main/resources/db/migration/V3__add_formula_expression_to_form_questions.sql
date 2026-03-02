ALTER TABLE form_questions
    ADD COLUMN IF NOT EXISTS formula_expression TEXT;

CREATE INDEX IF NOT EXISTS idx_form_questions_formula_expression
    ON form_questions (section_id)
    WHERE formula_expression IS NOT NULL;
