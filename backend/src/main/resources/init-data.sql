-- Insert default roles
INSERT INTO roles (role_code, role_name) VALUES 
('ADMIN', 'Administrator'),
('DOCTOR', 'Doctor'),
('NURSE', 'Nurse'),
('DATA_ENTRY', 'Data Entry Staff'),
('PHARMACIST', 'Pharmacist'),
('RECEPTIONIST', 'Receptionist')
ON CONFLICT (role_code) DO NOTHING;

-- Insert default departments
INSERT INTO departments (department_code, department_name) VALUES
('CARD', 'Cardiology'),
('NEURO', 'Neurology'),
('GEN', 'General Medicine'),
('PEDI', 'Pediatrics'),
('OB_GYN', 'Obstetrics & Gynecology')
ON CONFLICT (department_code) DO NOTHING;

-- Insert risk levels
INSERT INTO risk_levels (code, color, priority) VALUES
('LOW', '#10b981', 3),
('MEDIUM', '#f59e0b', 2),
('HIGH', '#ef4444', 1)
ON CONFLICT (code) DO NOTHING;

-- Insert sample indicators
INSERT INTO indicators (indicator_code, name, data_type, unit, is_input, is_derived) VALUES
('BP_SYS', 'Blood Pressure Systolic', 'Number', 'mmHg', true, false),
('BP_DIA', 'Blood Pressure Diastolic', 'Number', 'mmHg', true, false),
('HEART_RATE', 'Heart Rate', 'Number', 'bpm', true, false),
('BMI', 'Body Mass Index', 'Number', 'kg/m2', false, true),
('GLUCOSE', 'Blood Glucose', 'Number', 'mg/dL', true, false),
('CHOLESTEROL', 'Total Cholesterol', 'Number', 'mg/dL', true, false)
ON CONFLICT (indicator_code) DO NOTHING;

-- Insert sample form
INSERT INTO forms (form_code, form_name, version, is_active) VALUES
('GENERAL_CHECKUP', 'General Medical Checkup', '1.0', true),
('CARDIAC_RISK', 'Cardiac Risk Assessment', '1.0', true),
('DIABETES_SCREEN', 'Diabetes Screening', '1.0', true)
ON CONFLICT (form_code) DO NOTHING;

-- Insert variables for risk calculation
INSERT INTO variables (variable_code, data_type, description) VALUES
('RISK_SCORE', 'Number', 'Overall risk score'),
('CARDIAC_RISK', 'Number', 'Cardiac risk score'),
('DIABETES_RISK', 'Number', 'Diabetes risk score')
ON CONFLICT (variable_code) DO NOTHING;
