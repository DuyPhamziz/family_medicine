-- Add repeat group columns to form_questions if they don't exist
ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS group_id VARCHAR(255);
ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS is_repeatable_group BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS repeat_group_root BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS max_repeat INTEGER DEFAULT 1;
ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS label_add_button VARCHAR(255) DEFAULT 'Thêm mục khác';

-- Add repeat_index column to submission_answers (nullable to allow existing null rows)
ALTER TABLE submission_answers ADD COLUMN IF NOT EXISTS repeat_index INTEGER DEFAULT 0;

-- Create index for faster group queries
CREATE INDEX IF NOT EXISTS idx_form_questions_group_id ON form_questions(group_id);
