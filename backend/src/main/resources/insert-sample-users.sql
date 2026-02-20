-- Insert sample users (passwords are BCrypt hashed "123456")
-- Password: 123456 → $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Admin user
INSERT INTO users (email, password, full_name, phone, status, created_at) VALUES
('admin@familymed.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '0901234567', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;

-- Doctor user
INSERT INTO users (email, password, full_name, phone, status, created_at) VALUES
('doctor@familymed.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Nguyen Van A', '0912345678', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;

-- Nurse user
INSERT INTO users (email, password, full_name, phone, status, created_at) VALUES
('nurse@familymed.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nurse Tran Thi B', '0923456789', 'ACTIVE', NOW())
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email = 'admin@familymed.vn' AND r.role_code = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email = 'doctor@familymed.vn' AND r.role_code = 'DOCTOR'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email = 'nurse@familymed.vn' AND r.role_code = 'NURSE'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, email, created_at) VALUES
('PT001', 'Nguyen Van C', '1980-05-15', 'MALE', '0934567890', '123 Nguyen Hue, Q1, TPHCM', 'patient1@example.com', NOW()),
('PT002', 'Tran Thi D', '1975-08-22', 'FEMALE', '0945678901', '456 Le Loi, Q3, TPHCM', 'patient2@example.com', NOW()),
('PT003', 'Le Van E', '1990-12-10', 'MALE', '0956789012', '789 Hai Ba Trung, Q1, TPHCM', 'patient3@example.com', NOW())
ON CONFLICT (patient_code) DO NOTHING;

-- Insert sample diagnostic forms with sections and questions
DO $$
DECLARE
    v_form_id UUID;
    v_section_id UUID;
BEGIN
    -- Insert general checkup form
    INSERT INTO diagnostic_forms (form_name, form_desc, version, is_active, created_at)
    VALUES ('Đánh giá nguy cơ tiểu đường', 'Bảng câu hỏi đánh giá nguy cơ tiểu đường FINDRISC', '1.0', true, NOW())
    RETURNING form_id INTO v_form_id;

    -- Section 1: Thông tin cơ bản
    INSERT INTO form_sections (form_id, section_title, section_order, created_at)
    VALUES (v_form_id, 'Thông tin cơ bản', 1, NOW())
    RETURNING section_id INTO v_section_id;

    INSERT INTO form_questions (section_id, question_text, question_type, question_order, is_required, created_at)
    VALUES 
    (v_section_id, 'Tuổi của bạn?', 'SINGLE_CHOICE', 1, true, NOW()),
    (v_section_id, 'Chỉ số BMI của bạn (kg/m²)?', 'SINGLE_CHOICE', 2, true, NOW()),
    (v_section_id, 'Vòng eo của bạn (cm)?', 'SINGLE_CHOICE', 3, true, NOW());

    -- Section 2: Lối sống
    INSERT INTO form_sections (form_id, section_title, section_order, created_at)
    VALUES (v_form_id, 'Lối sống và tiền sử bệnh', '2', NOW())
    RETURNING section_id INTO v_section_id;

    INSERT INTO form_questions (section_id, question_text, question_type, question_order, is_required, created_at)
    VALUES 
    (v_section_id, 'Bạn có tập thể dục thể thao ít nhất 30 phút mỗi ngày không?', 'BOOLEAN', 1, true, NOW()),
    (v_section_id, 'Bạn có ăn rau hoặc trái cây mỗi ngày không?', 'BOOLEAN', 2, true, NOW()),
    (v_section_id, 'Bạn có từng dùng thuốc hạ huyết áp không?', 'BOOLEAN', 3, true, NOW()),
    (v_section_id, 'Bạn có từng phát hiện đường huyết cao không?', 'BOOLEAN', 4, true, NOW());

    -- Section 3: Tiền sử gia đình
    INSERT INTO form_sections (form_id, section_title, section_order, created_at)
    VALUES (v_form_id, 'Tiền sử gia đình', 3, NOW())
    RETURNING section_id INTO v_section_id;

    INSERT INTO form_questions (section_id, question_text, question_type, question_order, is_required, created_at)
    VALUES 
    (v_section_id, 'Có ai trong gia đình bạn bị tiểu đường không?', 'SINGLE_CHOICE', 1, true, NOW());

END $$;

