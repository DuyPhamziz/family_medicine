package com.familymed.common;

import com.familymed.form.entity.*;
import com.familymed.form.entity.FormQuestion.QuestionType;
import com.familymed.form.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DiagnosticFormRepository formRepository;
    private final FormSectionRepository sectionRepository;
    private final FormQuestionRepository questionRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    public DataInitializer(DiagnosticFormRepository formRepository,
                          FormSectionRepository sectionRepository,
                          FormQuestionRepository questionRepository,
                          ObjectMapper objectMapper,
                          ResourceLoader resourceLoader) {
        this.formRepository = formRepository;
        this.sectionRepository = sectionRepository;
        this.questionRepository = questionRepository;
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (formRepository.count() > 0) {
            System.out.println("✓ Diagnostic forms already initialized, skipping...");
            return;
        }

        System.out.println("🔄 Initializing diagnostic forms from JSON...");
        seedFromJSON();
    }

    private void seedFromJSON() {
        try {
            Resource resource = resourceLoader.getResource("classpath:questions_seed.json");
            if (!resource.exists()) {
                System.out.println("⚠️ questions_seed.json not found in classpath");
                return;
            }

            InputStream inputStream = resource.getInputStream();
            List<QuestionSeedDto> seedQuestions = objectMapper.readValue(inputStream, new TypeReference<List<QuestionSeedDto>>() {});

            // Create Main Form
            DiagnosticForm mainForm = new DiagnosticForm();
            mainForm.setFormId(UUID.randomUUID());
            mainForm.setFormName("Khảo sát sức khỏe tổng quát");
            mainForm.setDescription("Bộ câu hỏi thu thập thông tin đầu vào");
            mainForm.setCategory("GENERAL_INTAKE");
            mainForm.setVersion(1);
            mainForm = formRepository.save(mainForm);

            // Group by Section
            Map<String, List<QuestionSeedDto>> bySection = seedQuestions.stream()
                    .collect(Collectors.groupingBy(q -> q.getSection() != null ? q.getSection() : "General"));

            int sectionOrder = 1;
            List<FormQuestion> allQuestions = new ArrayList<>();

            for (Map.Entry<String, List<QuestionSeedDto>> entry : bySection.entrySet()) {
                String sectionName = entry.getKey();
                List<QuestionSeedDto> qs = entry.getValue();

                FormSection section = new FormSection();
                section.setSectionId(UUID.randomUUID());
                section.setForm(mainForm);
                section.setSectionName(sectionName);
                section.setSectionOrder(sectionOrder++);
                section = sectionRepository.save(section);

                int qOrder = 1;
                for (QuestionSeedDto qDto : qs) {
                    FormQuestion q = new FormQuestion();
                    q.setQuestionId(UUID.randomUUID());
                    q.setSection(section); // Link to Section
                    q.setQuestionCode(qDto.getCode());
                    q.setQuestionText(qDto.getText());
                    
                    // Map Type
                    try {
                        q.setQuestionType(QuestionType.valueOf(qDto.getType()));
                    } catch (Exception e) {
                        q.setQuestionType(QuestionType.TEXT);
                    }

                    q.setHelpText(qDto.getOriginalType());
                    q.setQuestionOrder(qOrder++);
                    q.setRequired(false); // Default false for now
                    
                    // Parse options if choice type
                    if (q.getQuestionType() == QuestionType.SINGLE_CHOICE || q.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                        q.setOptions(extractOptions(qDto.getOriginalType()));
                    }

                    allQuestions.add(q);
                }
            }
            
            questionRepository.saveAll(allQuestions);
            System.out.println("✓ Imported " + allQuestions.size() + " questions into " + bySection.size() + " sections.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private String extractOptions(String text) {
        if (text == null) return "[]";
        List<String> options = new ArrayList<>();
        // Simple heuristic: split by comma or numbered list
        // Try to match patterns like "1. A, 2. B" or "1: A, 2: B"
        // If not, just return as is or split by comma
        if (text.contains("1.") || text.contains("1:")) {
             String[] parts = text.split("(?=\\d+[.:])");
             for (String part : parts) {
                 String trimmed = part.trim().replaceAll("^\\d+[.:]\\s*", "");
                 if (!trimmed.isEmpty()) options.add(trimmed);
             }
        } else if (text.contains(",")) {
            String[] parts = text.split(",");
            for (String part : parts) {
                options.add(part.trim());
            }
        }
        
        try {
            return new ObjectMapper().writeValueAsString(options);
        } catch (Exception e) {
            return "[]";
        }
    }

    @Data
    static class QuestionSeedDto {
        private String section;
        private String code;
        private String text;
        private String type;
        private String originalType;
    }
}
