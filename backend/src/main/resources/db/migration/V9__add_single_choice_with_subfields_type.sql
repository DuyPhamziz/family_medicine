-- Migration: Add SINGLE_CHOICE_WITH_SUBFIELDS question type support
-- Date: 2026-03-07

ALTER TABLE form_questions
DROP CONSTRAINT IF EXISTS form_questions_question_type_check;

ALTER TABLE form_questions
ADD CONSTRAINT form_questions_question_type_check
CHECK (
    question_type IN (
        'SHORT_TEXT',
        'LONG_TEXT',
        'NUMBER',
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'MULTIPLE_CHOICE_WITH_SUBFIELDS',
        'SINGLE_CHOICE_WITH_SUBFIELDS',
        'MATRIX_FAMILY_DISEASE',
        'SELECT_DROPDOWN',
        'DATE',
        'BOOLEAN',
        'IMAGE_UPLOAD',
        'FILE_UPLOAD',
        'MEDICAL_HISTORY',
        'TEXT'
    )
);
