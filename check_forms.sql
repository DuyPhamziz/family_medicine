-- CHECK ALL FORMS INCLUDING INACTIVE ONES
-- Run this with: psql -U postgres -d family_medicine_db -f check_forms.sql

-- 1. Show ALL forms with their status
SELECT 
    form_id,
    form_name,
    description,
    status,
    created_at,
    updated_at
FROM diagnostic_forms
ORDER BY created_at DESC;

-- 2. Count forms by status
SELECT 
    status,
    COUNT(*) as count
FROM diagnostic_forms
GROUP BY status;

-- 3. Show forms with their sections (to see if forms have content)
SELECT 
    f.form_id,
    f.form_name,
    f.status,
    COUNT(s.section_id) as section_count
FROM diagnostic_forms f
LEFT JOIN form_sections s ON f.form_id = s.form_id
GROUP BY f.form_id, f.form_name, f.status
ORDER BY f.created_at DESC;

-- 4. Show if any forms have submissions (can't hard delete these)
SELECT 
    f.form_id,
    f.form_name,
    f.status,
    COUNT(pfs.submission_id) as submission_count
FROM diagnostic_forms f
LEFT JOIN patient_form_submissions pfs ON f.form_id = pfs.form_id
GROUP BY f.form_id, f.form_name, f.status
ORDER BY f.created_at DESC;
