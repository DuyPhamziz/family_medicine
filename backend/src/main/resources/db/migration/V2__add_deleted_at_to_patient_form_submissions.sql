ALTER TABLE patient_form_submissions
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_patient_form_submissions_deleted_at
    ON patient_form_submissions (deleted_at);
