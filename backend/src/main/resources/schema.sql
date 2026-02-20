CREATE TABLE IF NOT EXISTS guidelines (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    status VARCHAR(255),
    owner VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

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
    patient_id UUID NOT NULL,
    form_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    submission_data TEXT,
    total_score DOUBLE PRECISION,
    diagnostic_result TEXT,
    risk_level VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL
);


-- Constraints are handled by Hibernate (spring.jpa.hibernate.ddl-auto=update).
-- Explicit ALTER TABLE statements in schema.sql are removed to avoid conflicts with existing legacy constraints.
