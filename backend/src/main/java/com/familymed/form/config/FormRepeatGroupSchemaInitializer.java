package com.familymed.form.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FormRepeatGroupSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        ensureRepeatGroupSchema();
    }

    private void ensureRepeatGroupSchema() {
        executeSafe("ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS group_id VARCHAR(255)");
        executeSafe("ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS is_repeatable_group BOOLEAN NOT NULL DEFAULT false");
        executeSafe("ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS repeat_group_root BOOLEAN NOT NULL DEFAULT false");
        executeSafe("ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS max_repeat INTEGER");
        executeSafe("ALTER TABLE form_questions ADD COLUMN IF NOT EXISTS label_add_button VARCHAR(255)");
        executeSafe("ALTER TABLE submission_answers ADD COLUMN IF NOT EXISTS repeat_index INTEGER NOT NULL DEFAULT 0");
        executeSafe("CREATE INDEX IF NOT EXISTS idx_form_questions_group_id ON form_questions(group_id)");

        // Keep DB check constraint aligned with current QuestionType enum values.
        executeSafe("ALTER TABLE form_questions DROP CONSTRAINT IF EXISTS form_questions_question_type_check");
        executeSafe("ALTER TABLE form_questions ADD CONSTRAINT form_questions_question_type_check CHECK (question_type IN ('SHORT_TEXT','LONG_TEXT','NUMBER','SINGLE_CHOICE','MULTIPLE_CHOICE','MULTIPLE_CHOICE_WITH_SUBFIELDS','SINGLE_CHOICE_WITH_SUBFIELDS','MATRIX_FAMILY_DISEASE','SELECT_DROPDOWN','DATE','BOOLEAN','IMAGE_UPLOAD','FILE_UPLOAD','MEDICAL_HISTORY','TEXT'))");
    }

    private void executeSafe(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            log.warn("Repeat group schema init skipped: {} -> {}", sql, ex.getMessage());
        }
    }
}
