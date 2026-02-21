-- Script kiểm tra database Family Medicine

-- 1. Kiểm tra tất cả tables hiện có
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Kiểm tra table diagnostic_forms có tồn tại không
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'diagnostic_forms'
);

-- 3. Nếu có, xem cấu trúc table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'diagnostic_forms'
ORDER BY ordinal_position;

-- 4. Đếm số lượng forms
SELECT COUNT(*) as total_forms FROM diagnostic_forms;

-- 5. Xem tất cả forms (nếu có)
SELECT form_id, form_name, status, version, created_at 
FROM diagnostic_forms 
ORDER BY created_at DESC;

-- 6. Kiểm tra các table liên quan
SELECT 
    (SELECT COUNT(*) FROM diagnostic_forms) as forms_count,
    (SELECT COUNT(*) FROM form_sections) as sections_count,
    (SELECT COUNT(*) FROM form_questions) as questions_count,
    (SELECT COUNT(*) FROM form_question_options) as options_count;

-- 7. Kiểm tra foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND (tc.table_name = 'diagnostic_forms' 
        OR ccu.table_name = 'diagnostic_forms')
ORDER BY tc.table_name;
