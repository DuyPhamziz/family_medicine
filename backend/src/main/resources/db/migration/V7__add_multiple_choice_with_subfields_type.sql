-- Migration: Support MULTIPLE_CHOICE_WITH_SUBFIELDS question type
-- Date: 2026-03-06
-- Description: Updates form_questions constraint to allow MULTIPLE_CHOICE_WITH_SUBFIELDS question type

-- Drop the old constraint that doesn't include MULTIPLE_CHOICE_WITH_SUBFIELDS
ALTER TABLE form_questions
DROP CONSTRAINT IF EXISTS form_questions_question_type_check;

-- Add the new constraint with MULTIPLE_CHOICE_WITH_SUBFIELDS included
ALTER TABLE form_questions
ADD CONSTRAINT form_questions_question_type_check 
CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'IMAGE_UPLOAD', 'MULTIPLE_CHOICE_WITH_SUBFIELDS'));

-- Also update assessment_answers constraint if needed
ALTER TABLE assessment_answers
DROP CONSTRAINT IF EXISTS assessment_answers_answer_type_check;

ALTER TABLE assessment_answers
ADD CONSTRAINT assessment_answers_answer_type_check 
CHECK (answer_type IN ('TEXT', 'NUMBER', 'BOOLEAN', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'DATE', 'IMAGE_UPLOAD'));
