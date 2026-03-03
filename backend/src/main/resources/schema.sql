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

CREATE TABLE IF NOT EXISTS stored_files (
    file_id UUID PRIMARY KEY,
    original_file_name VARCHAR(500) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_data BYTEA NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS public_token UUID UNIQUE;

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS estimated_time INTEGER,
    ADD COLUMN IF NOT EXISTS icon_color VARCHAR(64);

ALTER TABLE diagnostic_forms
    ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS master_locked BOOLEAN NOT NULL DEFAULT false;

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

ALTER TABLE form_questions
    ADD COLUMN IF NOT EXISTS allow_additional_answers BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS max_additional_answers INTEGER;

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

-- ===== Question bank option table (separate from form_question_options) =====
CREATE TABLE IF NOT EXISTS question_bank_options (
    option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL,
    option_text TEXT NOT NULL,
    option_value VARCHAR(255),
    option_order INTEGER,
    points INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_question_bank_options_question_id ON question_bank_options(question_id);

-- FK constraints are managed by Hibernate @JoinColumn annotations (spring.jpa.hibernate.ddl-auto=update).
-- QuestionBankOption.java maps to question_bank_options table with proper @ForeignKey annotation.
-- FormQuestionOption.java maps to form_question_options table with proper @ForeignKey annotation.
-- Let Hibernate handle constraint creation/repair on startup via UPDATE mode.

-- ===== PUBLIC FORM ANTI-SPAM TABLES =====

-- Session tokens for public forms - prevents reuse and tracks access
CREATE TABLE IF NOT EXISTS public_form_sessions (
    session_token UUID PRIMARY KEY,
    form_id UUID NOT NULL,
    client_ip VARCHAR(45),  -- IPv6 compatible
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    used_at TIMESTAMP,
    submission_id UUID,
    CONSTRAINT fk_session_form FOREIGN KEY (form_id) REFERENCES diagnostic_forms(form_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_client_ip ON public_form_sessions(client_ip);
CREATE INDEX IF NOT EXISTS idx_session_created_at ON public_form_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON public_form_sessions(expires_at);

-- Rate limiting for public form submissions
CREATE TABLE IF NOT EXISTS public_form_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_ip VARCHAR(45) NOT NULL,
    form_id UUID NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    submission_count INTEGER NOT NULL DEFAULT 0,
    last_submission_at TIMESTAMP NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_rate_limit_form FOREIGN KEY (form_id) REFERENCES diagnostic_forms(form_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_date ON public_form_rate_limits(client_ip, submission_date);
CREATE INDEX IF NOT EXISTS idx_rate_limit_form_id ON public_form_rate_limits(form_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked ON public_form_rate_limits(blocked);

