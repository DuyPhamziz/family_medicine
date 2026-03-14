-- Migration: Add sub-fields support for MULTIPLE_CHOICE_WITH_SUBFIELDS question type
-- Date: 2026-03-06
-- Description: Adds columns to store sub-fields configuration in options and answers

-- Add sub_fields_config column to form_question_options table
ALTER TABLE form_question_options 
ADD COLUMN IF NOT EXISTS sub_fields_config TEXT;

COMMENT ON COLUMN form_question_options.sub_fields_config IS 
'JSON configuration for sub-fields when option is selected. Example: [{"key":"year","label":"Năm tiêm","type":"NUMBER"},{"key":"notes","label":"Ghi chú","type":"TEXT"}]';

-- Add sub_fields_data column to submission_answers table
ALTER TABLE submission_answers 
ADD COLUMN IF NOT EXISTS sub_fields_data TEXT;

COMMENT ON COLUMN submission_answers.sub_fields_data IS 
'JSON data storing answers for sub-fields when question type is MULTIPLE_CHOICE_WITH_SUBFIELDS. Example: {"Phế cầu":{"year":"2023","notes":"Tiêm 2 mũi"},"HPV":{"year":"2024"}}';
