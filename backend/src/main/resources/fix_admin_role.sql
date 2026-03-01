-- Fix admin user role
-- This script ensures admin user has the correct role assigned

-- First, ensure roles exist with fixed IDs
INSERT INTO roles (role_id, role_code, role_name) VALUES
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid, 'ROLE_ADMIN', 'Administrator'),
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid, 'ROLE_DOCTOR', 'Doctor'),
('2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid, 'ROLE_NURSE', 'Nurse')
ON CONFLICT (role_code) DO NOTHING;

-- Update existing role codes if they still have the old format (without ROLE_ prefix)
UPDATE roles SET role_code = 'ROLE_ADMIN' WHERE role_code = 'ADMIN' AND role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid;
UPDATE roles SET role_code = 'ROLE_DOCTOR' WHERE role_code = 'DOCTOR' AND role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid;
UPDATE roles SET role_code = 'ROLE_NURSE' WHERE role_code = 'NURSE' AND role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid;

-- Update admin user with correct role if exists
UPDATE users 
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0001'::uuid,
    is_active = true
WHERE email = 'admin@familymed.vn';

-- Update doctor user with correct role if exists
UPDATE users 
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0002'::uuid,
    is_active = true
WHERE email = 'doctor@familymed.vn';

-- Update nurse user with correct role if exists
UPDATE users 
SET role_id = '2f4b7b3c-3d3c-4d3d-8d3d-3d3d3d3d0003'::uuid,
    is_active = true
WHERE email = 'nurse@familymed.vn';

-- Verify the updates
SELECT u.email, u.username, r.role_code, r.role_name 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.role_id 
WHERE u.email IN ('admin@familymed.vn', 'doctor@familymed.vn', 'nurse@familymed.vn')
ORDER BY u.email;
