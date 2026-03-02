-- ================================================================
-- Create hospital_templates table for Excel export customization
-- This table stores hospital configuration for report generation
-- ================================================================

CREATE TABLE IF NOT EXISTS hospital_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name VARCHAR(255) NOT NULL DEFAULT 'Family Medicine Clinic',
    department VARCHAR(255) NOT NULL DEFAULT 'Clinical Assessment',
    address TEXT NOT NULL DEFAULT '123 Medical Center, City',
    logo_base64 TEXT, -- Base64-encoded hospital logo (PNG/JPG)
    disclaimer_text TEXT DEFAULT 'This report is generated for clinical use only. 
It should not replace professional medical advice. 
Always consult with a healthcare professional.',
    signature_required BOOLEAN NOT NULL DEFAULT TRUE,
    stamp_required BOOLEAN NOT NULL DEFAULT TRUE,
    footer_text TEXT DEFAULT '© Hospital Name. All rights reserved. 
Confidential - For authorized personnel only.',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on default template lookup
CREATE INDEX idx_hospital_templates_default ON hospital_templates(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_hospital_templates_active ON hospital_templates(active) WHERE active = TRUE;

-- Insert default template if not exists
INSERT INTO hospital_templates (hospital_name, department, address, is_default, active)
VALUES (
    'Family Medicine Clinic',
    'Clinical Assessment',
    '123 Medical Center, City',
    TRUE,
    TRUE
)
ON CONFLICT DO NOTHING;

-- Add audit columns to hospital_templates if using BaseEntity timestamp pattern
COMMENT ON TABLE hospital_templates IS 'Hospital configuration templates for Excel/PDF report export';
COMMENT ON COLUMN hospital_templates.template_id IS 'Unique identifier for the template';
COMMENT ON COLUMN hospital_templates.hospital_name IS 'Hospital name displayed in reports';
COMMENT ON COLUMN hospital_templates.department IS 'Department name displayed in reports';
COMMENT ON COLUMN hospital_templates.address IS 'Hospital address displayed in reports';
COMMENT ON COLUMN hospital_templates.logo_base64 IS 'Base64-encoded hospital logo for embedding in Excel';
COMMENT ON COLUMN hospital_templates.disclaimer_text IS 'Medical disclaimer text for reports';
COMMENT ON COLUMN hospital_templates.signature_required IS 'Whether signature line should appear in reports';
COMMENT ON COLUMN hospital_templates.stamp_required IS 'Whether stamp/seal placeholder should appear in reports';
COMMENT ON COLUMN hospital_templates.footer_text IS 'Footer text for reports';
COMMENT ON COLUMN hospital_templates.is_default IS 'Mark this as the default template to use';
