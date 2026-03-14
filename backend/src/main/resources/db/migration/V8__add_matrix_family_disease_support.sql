-- Migration: Add MATRIX_FAMILY_DISEASE question type support
-- Date: 2026-03-06

ALTER TABLE form_questions
DROP CONSTRAINT IF EXISTS form_questions_question_type_check;

ALTER TABLE form_questions
ADD CONSTRAINT form_questions_question_type_check
CHECK (
    question_type IN (
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'TEXT',
        'NUMBER',
        'DATE',
        'BOOLEAN',
        'IMAGE_UPLOAD',
        'MULTIPLE_CHOICE_WITH_SUBFIELDS',
        'MATRIX_FAMILY_DISEASE'
    )
);

CREATE TABLE IF NOT EXISTS family_disease_matrix_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL UNIQUE,
    rows_json TEXT,
    columns_json TEXT,
    allow_additional_column BOOLEAN NOT NULL DEFAULT FALSE,
    allow_additional_row BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_matrix_config_question
        FOREIGN KEY (question_id) REFERENCES form_questions(question_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_family_disease_matrix_config_question_id
ON family_disease_matrix_config(question_id);

CREATE TABLE IF NOT EXISTS answer_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL,
    question_id UUID NOT NULL,
    row_key VARCHAR(255) NOT NULL,
    column_key VARCHAR(255) NOT NULL,
    has_disease BOOLEAN NOT NULL DEFAULT FALSE,
    diagnosis_year INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_answer_matrix_response
        FOREIGN KEY (response_id) REFERENCES patient_form_submissions(submission_id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_matrix_question
        FOREIGN KEY (question_id) REFERENCES form_questions(question_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_answer_matrix_response_id ON answer_matrix(response_id);
CREATE INDEX IF NOT EXISTS idx_answer_matrix_question_id ON answer_matrix(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_matrix_row_col ON answer_matrix(question_id, row_key, column_key);
