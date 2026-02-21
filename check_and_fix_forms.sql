-- ===== SCRIPT KIỂM TRA VÀ FIX DATABASE FORMS =====

-- 1. XEM TẤT CẢ FORMS (kể cả INACTIVE)
SELECT 
    form_id, 
    form_name, 
    status, 
    version,
    category,
    description,
    created_at,
    updated_at
FROM diagnostic_forms 
ORDER BY created_at DESC;

-- 2. ĐẾM FORMS THEO STATUS
SELECT 
    status, 
    COUNT(*) as count 
FROM diagnostic_forms 
GROUP BY status;

-- 3. XEM FORMS VỚI SECTIONS VÀ QUESTIONS
SELECT 
    f.form_id,
    f.form_name,
    f.status,
    COUNT(DISTINCT s.section_id) as num_sections,
    COUNT(DISTINCT q.question_id) as num_questions
FROM diagnostic_forms f
LEFT JOIN form_sections s ON f.form_id = s.form_id
LEFT JOIN form_questions q ON s.section_id = q.section_id
GROUP BY f.form_id, f.form_name, f.status
ORDER BY f.created_at DESC;

-- 4. KHÔI PHỤC TẤT CẢ FORMS VỀ ACTIVE (nếu cần test)
-- UPDATE diagnostic_forms SET status = 'ACTIVE' WHERE status = 'INACTIVE';

-- 5. XÓA THẬT TẤT CẢ FORMS (HARD DELETE - CHỈ DÙNG KHI TEST)
-- CẢNH BÁO: Lệnh này sẽ xóa hẳn data!
-- DELETE FROM form_question_options; -- Xóa options trước
-- DELETE FROM form_questions;        -- Xóa câu hỏi
-- DELETE FROM form_sections;         -- Xóa sections
-- DELETE FROM diagnostic_forms;      -- Xóa forms

-- 6. RESET SEQUENCES (nếu cần)
-- SELECT setval(pg_get_serial_sequence('diagnostic_forms', 'form_id'), 1, false);
