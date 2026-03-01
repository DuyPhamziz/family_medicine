package com.familymed.form.service;

import com.familymed.form.entity.*;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormVersionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Handles form versioning: creating snapshots, publishing versions, managing version history
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FormVersioningService {
    
    private final FormVersionRepository formVersionRepository;
    private final DiagnosticFormRepository diagnosticFormRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Create a new draft version by copying current form structure
     */
    @Transactional
    public FormVersion createNewVersion(UUID formId, String changeLog) {
        DiagnosticForm form = diagnosticFormRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found: " + formId));
        
        // Get latest version number
        Optional<FormVersion> latestVersion = formVersionRepository
            .findFirstByFormFormIdAndStatusOrderByVersionNumberDesc(
                formId,
                FormVersion.VersionStatus.PUBLISHED
            );
        int nextVersionNumber = latestVersion.map(FormVersion::getVersionNumber).orElse(0) + 1;
        
        // Serialize current form structure
        String formSchemaJson = serializeFormStructure(form);
        String scoringRulesJson = form.getScoringRules();
        
        FormVersion newVersion = new FormVersion();
        newVersion.setVersionId(UUID.randomUUID());
        newVersion.setForm(form);
        newVersion.setVersionNumber(nextVersionNumber);
        newVersion.setFormSchemaJson(formSchemaJson);
        newVersion.setScoringRulesJson(scoringRulesJson);
        newVersion.setStatus(FormVersion.VersionStatus.DRAFT);
        newVersion.setPublishedAt(LocalDateTime.now());
        newVersion.setChangeLog(changeLog);
        newVersion.setIsActive(false);
        
        return formVersionRepository.save(newVersion);
    }
    
    /**
     * Publish a draft version (make it live for new submissions)
     */
    @Transactional
    public FormVersion publishVersion(UUID versionId) throws Exception {
        FormVersion version = formVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found: " + versionId));
        
        if (!version.getStatus().equals(FormVersion.VersionStatus.DRAFT)) {
            throw new RuntimeException("Cannot publish non-draft version");
        }
        
        // Deprecate previous active version
        DiagnosticForm form = version.getForm();
        if (form.getPublishedVersionId() != null) {
            Optional<FormVersion> previousVersion = formVersionRepository.findById(form.getPublishedVersionId());
            previousVersion.ifPresent(v -> {
                v.setStatus(FormVersion.VersionStatus.DEPRECATED);
                v.setIsActive(false);
                formVersionRepository.save(v);
            });
        }
        
        // Activate new version
        version.setStatus(FormVersion.VersionStatus.PUBLISHED);
        version.setIsActive(true);
        version.setPublishedAt(LocalDateTime.now());
        form.setPublishedVersionId(version.getVersionId());
        form.setVersion(version.getVersionNumber());
        
        diagnosticFormRepository.save(form);
        return formVersionRepository.save(version);
    }
    
    /**
     * Get version history for a form
     */
    @Transactional(readOnly = true)
    public List<FormVersion> getVersionHistory(UUID formId) {
        return formVersionRepository.findByFormFormIdOrderByVersionNumberDesc(formId);
    }
    
    /**
     * Get currently published version
     */
    @Transactional(readOnly = true)
    public Optional<FormVersion> getPublishedVersion(UUID formId) {
        return formVersionRepository.findFirstByFormFormIdAndStatusOrderByVersionNumberDesc(
                formId,
                FormVersion.VersionStatus.PUBLISHED
        );
    }
    
    /**
     * Serialize complete form structure (sections, questions, options, conditions)
     */
    private String serializeFormStructure(DiagnosticForm form) {
        try {
            Map<String, Object> schema = new HashMap<>();
            schema.put("formId", form.getFormId());
            schema.put("formName", form.getFormName());
            schema.put("description", form.getDescription());
            schema.put("category", form.getCategory());
            
            // Serialize sections and questions
            List<Map<String, Object>> sectionsData = new ArrayList<>();
            if (form.getSections() != null) {
                for (FormSection section : form.getSections()) {
                    Map<String, Object> sectionMap = new HashMap<>();
                    sectionMap.put("sectionId", section.getSectionId());
                    sectionMap.put("sectionName", section.getSectionName());
                    sectionMap.put("sectionOrder", section.getSectionOrder());
                    
                    List<Map<String, Object>> questionsData = new ArrayList<>();
                    if (section.getQuestions() != null) {
                        for (FormQuestion question : section.getQuestions()) {
                            Map<String, Object> questionMap = new HashMap<>();
                            questionMap.put("questionId", question.getQuestionId());
                            questionMap.put("questionCode", question.getQuestionCode());
                            questionMap.put("questionText", question.getQuestionText());
                            questionMap.put("questionType", question.getQuestionType());
                            questionMap.put("required", question.getRequired());
                            questionMap.put("points", question.getPoints());
                            questionMap.put("unit", question.getUnit());
                            questionMap.put("minValue", question.getMinValue());
                            questionMap.put("maxValue", question.getMaxValue());
                            questionMap.put("helpText", question.getHelpText());
                            
                            // Serialize options
                            List<Map<String, Object>> optionsData = new ArrayList<>();
                            if (question.getOptionItems() != null) {
                                for (FormQuestionOption option : question.getOptionItems()) {
                                    Map<String, Object> optionMap = new HashMap<>();
                                    optionMap.put("optionId", option.getOptionId());
                                    optionMap.put("optionText", option.getOptionText());
                                    optionMap.put("optionValue", option.getOptionValue());
                                    optionMap.put("points", option.getPoints());
                                    optionsData.add(optionMap);
                                }
                            }
                            questionMap.put("options", optionsData);
                            
                            questionsData.add(questionMap);
                        }
                    }
                    sectionMap.put("questions", questionsData);
                    sectionsData.add(sectionMap);
                }
            }
            schema.put("sections", sectionsData);
            
            return objectMapper.writeValueAsString(schema);
        } catch (Exception e) {
            log.error("Error serializing form structure", e);
            throw new RuntimeException("Failed to serialize form", e);
        }
    }
}
