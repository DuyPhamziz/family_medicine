-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert roles with fixed IDs
INSERT INTO roles (role_id, role_code, role_name) VALUES
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid, 'ADMIN', 'Administrator'),
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid, 'DOCTOR', 'Doctor'),
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid, 'NURSE', 'Nurse')
ON CONFLICT (role_code) DO NOTHING;

-- Insert users (password: 123456)
INSERT INTO users (user_id, username, password_hash, full_name, email, role_id, is_active, created_at)
VALUES ('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d1001'::uuid, 'ADMIN001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@familymed.vn', '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid, true, NOW())
ON CONFLICT (email) DO UPDATE
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid, is_active = true;

INSERT INTO users (user_id, username, password_hash, full_name, email, role_id, is_active, created_at)
VALUES ('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d1002'::uuid, 'DOCTOR001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr Nguyen Van A', 'doctor@familymed.vn', '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid, true, NOW())
ON CONFLICT (email) DO UPDATE
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid, is_active = true;

INSERT INTO users (user_id, username, password_hash, full_name, email, role_id, is_active, created_at)
VALUES ('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d1003'::uuid, 'NURSE001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurse Tran Thi B', 'nurse@familymed.vn', '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid, true, NOW())
ON CONFLICT (email) DO UPDATE
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid, is_active = true;

-- Insert patients (assign to doctor)
INSERT INTO patients (patient_id, patient_code, full_name, date_of_birth, gender, phone_number, email, address, doctor_id, status)
SELECT gen_random_uuid(), 'PT001', 'Nguyen Van C', '1980-05-15', 'MALE', '0934567890', 'patient1@example.com', '123 Nguyen Hue, Q1, HCMC', u.user_id, 'ACTIVE'
FROM users u WHERE u.email = 'doctor@familymed.vn'
ON CONFLICT (patient_code) DO NOTHING;

INSERT INTO patients (patient_id, patient_code, full_name, date_of_birth, gender, phone_number, email, address, doctor_id, status)
SELECT gen_random_uuid(), 'PT002', 'Tran Thi D', '1975-08-22', 'FEMALE', '0945678901', 'patient2@example.com', '456 Le Loi, Q3, HCMC', u.user_id, 'ACTIVE'
FROM users u WHERE u.email = 'doctor@familymed.vn'
ON CONFLICT (patient_code) DO NOTHING;

INSERT INTO patients (patient_id, patient_code, full_name, date_of_birth, gender, phone_number, email, address, doctor_id, status)
SELECT gen_random_uuid(), 'PT003', 'Le Van E', '1990-12-10', 'MALE', '0956789012', 'patient3@example.com', '789 Hai Ba Trung, Q1, HCMC', u.user_id, 'ACTIVE'
FROM users u WHERE u.email = 'doctor@familymed.vn'
ON CONFLICT (patient_code) DO NOTHING;

-- Insert sample diagnostic form with sections and questions
DO $$
DECLARE
    v_form_id UUID;
    v_section1_id UUID;
    v_section2_id UUID;
    v_section3_id UUID;
BEGIN
    v_form_id := gen_random_uuid();

    INSERT INTO diagnostic_forms (form_id, form_name, description, category, status, version)
    VALUES (
        v_form_id,
        'Diabetes risk assessment',
        'Sample screening form',
        'Prevention',
        'ACTIVE',
        1
    );

    v_section1_id := gen_random_uuid();
    INSERT INTO form_sections (section_id, form_id, section_name, section_order)
    VALUES (v_section1_id, v_form_id, 'Basic information', 1);

    INSERT INTO form_questions (question_id, section_id, question_code, question_order, question_text, question_type, options, required)
    VALUES
    (gen_random_uuid(), v_section1_id, 'Q1', 1, 'Age', 'SINGLE_CHOICE', '["<45","45-54","55-64","65+"]', true),
    (gen_random_uuid(), v_section1_id, 'Q2', 2, 'BMI', 'SINGLE_CHOICE', '["<25","25-30",">30"]', true),
    (gen_random_uuid(), v_section1_id, 'Q3', 3, 'Waist circumference', 'SINGLE_CHOICE', '["<90","90-100",">100"]', true);

    v_section2_id := gen_random_uuid();
    INSERT INTO form_sections (section_id, form_id, section_name, section_order)
    VALUES (v_section2_id, v_form_id, 'Lifestyle', 2);

    INSERT INTO form_questions (question_id, section_id, question_code, question_order, question_text, question_type, required)
    VALUES
    (gen_random_uuid(), v_section2_id, 'Q4', 1, 'Exercise at least 30 minutes per day?', 'BOOLEAN', true),
    (gen_random_uuid(), v_section2_id, 'Q5', 2, 'Eat vegetables or fruit daily?', 'BOOLEAN', true),
    (gen_random_uuid(), v_section2_id, 'Q6', 3, 'On blood pressure medication?', 'BOOLEAN', true),
    (gen_random_uuid(), v_section2_id, 'Q7', 4, 'History of high blood glucose?', 'BOOLEAN', true);

    v_section3_id := gen_random_uuid();
    INSERT INTO form_sections (section_id, form_id, section_name, section_order)
    VALUES (v_section3_id, v_form_id, 'Family history', 3);

    INSERT INTO form_questions (question_id, section_id, question_code, question_order, question_text, question_type, options, required)
    VALUES
    (gen_random_uuid(), v_section3_id, 'Q8', 1, 'Family history of diabetes?', 'SINGLE_CHOICE', '["None","Parents","Siblings"]', true);
END $$;
