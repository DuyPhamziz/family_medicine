package com.familymed.form.service;

import com.familymed.form.entity.*;
import com.familymed.form.repository.*;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.dto.*;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Collections;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormService {
    
    private final DiagnosticFormRepository formRepository;
    private final FormQuestionRepository questionRepository;
    private final FormQuestionOptionRepository optionRepository;
    private final PatientFormSubmissionRepository submissionRepository;
    private final FormSectionRepository sectionRepository;
    private final FormVersionRepository formVersionRepository;
    private final FormSubmissionSnapshotRepository snapshotRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RiskCalculationService riskCalculationService;
    private final AssessmentAnswerRepository answerRepository;
    private final ConditionalLogicService conditionalLogicService;
 

    
    @Transactional(readOnly = true)
    public DiagnosticFormDTO getFormWithQuestions(UUID formId) {
        DiagnosticForm form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        // Sections are fetched lazily, but within Transaction it should be fine.
        // If not, we can force initialize or use EntityGraph.
        // Assuming simple access works due to Transactional.
        return DiagnosticFormDTO.fromForm(form, form.getSections());
    }
    
    @Transactional(readOnly = true)
    public List<DiagnosticFormDTO> getAllActiveForms() {
        List<DiagnosticForm> forms = formRepository.findAll();
        return forms.stream()
                .filter(form -> form.getStatus() == DiagnosticForm.FormStatus.ACTIVE
                        || form.getStatus() == DiagnosticForm.FormStatus.PUBLISHED)
                .map(form -> {
            return DiagnosticFormDTO.fromForm(form, form.getSections());
        }).toList();
    }
    
    @Transactional
    public PatientFormSubmissionDTO submitForm(SubmitFormRequest request, UUID doctorId) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        DiagnosticForm form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // Get current published version
        FormVersion formVersion = formVersionRepository
            .findFirstByFormFormIdAndStatusOrderByVersionNumberDesc(
                request.getFormId(),
                FormVersion.VersionStatus.PUBLISHED
            )
                .orElseThrow(() -> new RuntimeException("No published form version found"));
        
        // Parse answers
        Map<String, Object> answersMap = new HashMap<>();
        try {
            answersMap = objectMapper.readValue(request.getSubmissionData(), Map.class);
        } catch (Exception e) {
            log.warn("Could not parse submission data as map", e);
        }
        
        // Calculate scores and results
        Map<String, Object> result = calculateDiagnosticResult(form, request.getSubmissionData());
        
        PatientFormSubmission submission = new PatientFormSubmission();
        submission.setSubmissionId(UUID.randomUUID());
        submission.setPatient(patient);
        submission.setForm(form);
        submission.setFormVersion(formVersion); // ← NEW: track which version was submitted
        submission.setDoctor(doctor);
        submission.setSubmissionData(request.getSubmissionData());
        submission.setTotalScore((Double) result.get("totalScore"));
        submission.setRiskLevel((String) result.get("riskLevel"));
        submission.setDiagnosticResult((String) result.getOrDefault("diagnosticResult", "{}").toString());
        submission.setNotes(request.getNotes());
        submission.setStatus(PatientFormSubmission.SubmissionStatus.COMPLETED);
        
        PatientFormSubmission savedSubmission = submissionRepository.save(submission);
        
        // ← NEW: Create immutable snapshot of form + answers
        try {
            FormSubmissionSnapshot snapshot = new FormSubmissionSnapshot();
            snapshot.setSnapshotId(UUID.randomUUID());
            snapshot.setSubmission(savedSubmission);
            snapshot.setFormVersion(formVersion);
            
            Map<String, Object> snapshotData = new HashMap<>();
            snapshotData.put("formSchema", objectMapper.readValue(formVersion.getFormSchemaJson(), Map.class));
            snapshotData.put("answers", answersMap);
            snapshotData.put("conditionalResults", conditionalLogicService.evaluateConditions(form.getFormId(), answersMap));
            snapshotData.put("submittedAt", LocalDateTime.now());
            
            snapshot.setSnapshotJson(objectMapper.writeValueAsString(snapshotData));
            snapshotRepository.save(snapshot);
        } catch (Exception e) {
            log.warn("Could not create submission snapshot", e);
        }
        
        return PatientFormSubmissionDTO.fromSubmission(savedSubmission);
    }
    
    public List<PatientFormSubmissionDTO> getPatientSubmissions(UUID patientId) {
        List<PatientFormSubmission> submissions = submissionRepository.findByPatientPatientId(patientId);
        return submissions.stream().map(PatientFormSubmissionDTO::fromSubmission).toList();
    }
    
    public List<PatientFormSubmissionDTO> getDoctorSubmissions(UUID doctorId) {
        List<PatientFormSubmission> submissions = submissionRepository.findByDoctorUserId(doctorId);
        return submissions.stream().map(PatientFormSubmissionDTO::fromSubmission).toList();
    }
    
    private Map<String, Object> calculateDiagnosticResult(DiagnosticForm form, String submissionDataJson) {
        // Placeholder for calculation logic
        // In real impl, parse JSON answers and match with Question points
        return Map.of(
            "totalScore", 0.0,
            "riskLevel", "LOW",
            "diagnosticResult", "{}"
        );
    }
    
    // ===== ADMIN FORM MANAGEMENT =====
    
    @Transactional
    public DiagnosticFormDTO createForm(DiagnosticFormDTO dto) {
        DiagnosticForm form = new DiagnosticForm();
        form.setFormId(UUID.randomUUID());
        form.setFormName(dto.getFormName());
        form.setDescription(dto.getDescription());
        form.setCategory(dto.getCategory());
        form.setEstimatedTime(dto.getEstimatedTime());
        form.setIconColor(dto.getIconColor());
        form.setVersion(1);
        form.setStatus(parseStatus(dto.getStatus()));
        form.setIsPublic(Boolean.TRUE.equals(dto.getIsPublic()));
        if (Boolean.TRUE.equals(form.getIsPublic())) {
            form.setPublicToken(dto.getPublicToken() != null ? dto.getPublicToken() : UUID.randomUUID());
        }
        
        DiagnosticForm saved = formRepository.save(form);
        return DiagnosticFormDTO.fromForm(saved, Collections.emptyList());
    }
    
    @Transactional
    public DiagnosticFormDTO updateForm(UUID id, DiagnosticFormDTO dto) {
        DiagnosticForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        form.setFormName(dto.getFormName());
        form.setDescription(dto.getDescription());
        form.setCategory(dto.getCategory());
        form.setEstimatedTime(dto.getEstimatedTime());
        form.setIconColor(dto.getIconColor());
        form.setStatus(parseStatus(dto.getStatus()));
        form.setIsPublic(Boolean.TRUE.equals(dto.getIsPublic()));

        if (Boolean.TRUE.equals(form.getIsPublic()) && form.getPublicToken() == null) {
            form.setPublicToken(UUID.randomUUID());
        }
        if (dto.getPublicToken() != null) {
            form.setPublicToken(dto.getPublicToken());
        }
        
        DiagnosticForm updated = formRepository.save(form);
        return DiagnosticFormDTO.fromForm(updated, updated.getSections());
    }
    
    @Transactional
    public void deleteForm(UUID id) {
        DiagnosticForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        // Check if form has been used in submissions
        long submissionCount = submissionRepository.countByFormFormId(id);
        if (submissionCount > 0) {
            // Soft delete if form has been used
            form.setStatus(DiagnosticForm.FormStatus.INACTIVE);
            formRepository.save(form);
        } else {
            // Hard delete if form is unused
            formRepository.delete(form);
        }
    }
    
    @Transactional(readOnly = true)
    public List<DiagnosticFormDTO> getAllForms() {
        List<DiagnosticForm> forms = formRepository.findAll();
        return forms.stream()
                .filter(form -> form.getStatus() != DiagnosticForm.FormStatus.INACTIVE) // Don't show inactive
                .map(form -> DiagnosticFormDTO.fromForm(form, form.getSections()))
                .toList();
    }

    // ===== ADMIN VERSIONING & DEFINITIONS =====

    @Transactional
    public DiagnosticFormDTO createNewVersion(UUID formId, CreateFormVersionRequest request) {
        DiagnosticForm existing = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        existing.setStatus(DiagnosticForm.FormStatus.ARCHIVED);
        formRepository.save(existing);

        DiagnosticForm newForm = new DiagnosticForm();
        newForm.setFormId(UUID.randomUUID());
        newForm.setFormName(request.getFormName() != null && !request.getFormName().isBlank()
                ? request.getFormName()
                : existing.getFormName());
        newForm.setDescription(request.getDescription() != null ? request.getDescription() : existing.getDescription());
        newForm.setCategory(request.getCategory() != null ? request.getCategory() : existing.getCategory());
        newForm.setEstimatedTime(existing.getEstimatedTime());
        newForm.setIconColor(existing.getIconColor());
        newForm.setVersion(existing.getVersion() != null ? existing.getVersion() + 1 : 1);
        newForm.setStatus(DiagnosticForm.FormStatus.ACTIVE);

        if (existing.getSections() != null) {
            List<FormSection> newSections = existing.getSections().stream().map(section -> {
                FormSection copiedSection = new FormSection();
                copiedSection.setForm(newForm);
                copiedSection.setSectionName(section.getSectionName());
                copiedSection.setSectionOrder(section.getSectionOrder());

                if (section.getQuestions() != null) {
                    List<FormQuestion> newQuestions = section.getQuestions().stream().map(question -> {
                        FormQuestion copiedQuestion = new FormQuestion();
                        copiedQuestion.setQuestionId(UUID.randomUUID());
                        copiedQuestion.setSection(copiedSection);
                        copiedQuestion.setQuestionCode(question.getQuestionCode());
                        copiedQuestion.setQuestionOrder(question.getQuestionOrder());
                        copiedQuestion.setQuestionText(question.getQuestionText());
                        copiedQuestion.setQuestionType(question.getQuestionType());
                        copiedQuestion.setOptions(question.getOptions());
                        copiedQuestion.setUnit(question.getUnit());
                        copiedQuestion.setMinValue(question.getMinValue());
                        copiedQuestion.setMaxValue(question.getMaxValue());
                        copiedQuestion.setPoints(question.getPoints());
                        copiedQuestion.setRequired(question.getRequired());
                        copiedQuestion.setHelpText(question.getHelpText());
                        copiedQuestion.setDisplayCondition(question.getDisplayCondition());

                        if (question.getOptionItems() != null) {
                            List<FormQuestionOption> copiedOptions = question.getOptionItems().stream().map(option -> {
                                FormQuestionOption copiedOption = new FormQuestionOption();
                                copiedOption.setQuestion(copiedQuestion);
                                copiedOption.setOptionText(option.getOptionText());
                                copiedOption.setOptionValue(option.getOptionValue());
                                copiedOption.setOptionOrder(option.getOptionOrder());
                                copiedOption.setPoints(option.getPoints());
                                return copiedOption;
                            }).toList();
                            copiedQuestion.setOptionItems(copiedOptions);
                        }

                        return copiedQuestion;
                    }).toList();
                    copiedSection.setQuestions(newQuestions);
                }

                return copiedSection;
            }).toList();

            newForm.setSections(newSections);
        }

        DiagnosticForm saved = formRepository.save(newForm);
        return DiagnosticFormDTO.fromForm(saved, saved.getSections());
    }

    @Transactional
    public FormSectionDTO createSection(UUID formId, CreateSectionRequest request) {
        DiagnosticForm form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));

        FormSection section = new FormSection();
        section.setForm(form);
        section.setSectionName(request.getSectionName());
        section.setSectionOrder(request.getSectionOrder() != null ? request.getSectionOrder() : 1);

        FormSection saved = sectionRepository.save(section);
        return FormSectionDTO.fromSection(saved);
    }

    @Transactional
    public FormSectionDTO updateSection(UUID sectionId, UpdateSectionRequest request) {
        FormSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        if (request.getSectionName() != null) {
            section.setSectionName(request.getSectionName());
        }
        if (request.getSectionOrder() != null) {
            section.setSectionOrder(request.getSectionOrder());
        }

        FormSection saved = sectionRepository.save(section);
        return FormSectionDTO.fromSection(saved);
    }

    @Transactional
    public void deleteSection(UUID sectionId) {
        FormSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        sectionRepository.delete(section);
    }

    @Transactional
    public FormQuestionDTO createQuestion(UUID sectionId, CreateQuestionRequest request) {
        FormSection section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        FormQuestion question = new FormQuestion();
        question.setQuestionId(UUID.randomUUID());
        question.setSection(section);
        question.setQuestionCode(generateQuestionCode(request.getQuestionCode()));
        question.setQuestionOrder(request.getQuestionOrder() != null ? request.getQuestionOrder() : 1);
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(FormQuestion.QuestionType.valueOf(request.getQuestionType()));
        question.setUnit(request.getUnit());
        question.setMinValue(request.getMinValue());
        question.setMaxValue(request.getMaxValue());
        question.setPoints(request.getPoints());
        question.setRequired(request.getRequired() != null ? request.getRequired() : Boolean.TRUE);
        question.setHelpText(request.getHelpText());
        question.setDisplayCondition(request.getDisplayCondition());

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<FormQuestionOption> optionItems = request.getOptions().stream()
                    .filter(option -> option.getOptionText() != null && !option.getOptionText().isBlank())
                    .map(option -> toOptionEntity(option, question))
                    .toList();
            question.setOptionItems(optionItems);
            question.setOptions(optionsToJson(optionItems));
        }

        FormQuestion saved = questionRepository.save(question);
        return FormQuestionDTO.fromQuestion(saved);
    }

    @Transactional
    public FormQuestionDTO updateQuestion(UUID questionId, UpdateQuestionRequest request) {
        FormQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (request.getQuestionCode() != null) {
            question.setQuestionCode(request.getQuestionCode());
        }
        if (request.getQuestionOrder() != null) {
            question.setQuestionOrder(request.getQuestionOrder());
        }
        if (request.getQuestionText() != null) {
            question.setQuestionText(request.getQuestionText());
        }
        if (request.getQuestionType() != null) {
            question.setQuestionType(FormQuestion.QuestionType.valueOf(request.getQuestionType()));
        }
        question.setUnit(request.getUnit());
        question.setMinValue(request.getMinValue());
        question.setMaxValue(request.getMaxValue());
        question.setPoints(request.getPoints());
        question.setRequired(request.getRequired() != null ? request.getRequired() : question.getRequired());
        question.setHelpText(request.getHelpText());
        question.setDisplayCondition(request.getDisplayCondition());

        if (request.getOptions() != null) {
            if (question.getOptionItems() == null) {
                question.setOptionItems(new java.util.ArrayList<>());
            }
            question.getOptionItems().clear();
            List<FormQuestionOption> optionItems = request.getOptions().stream()
                    .filter(option -> option.getOptionText() != null && !option.getOptionText().isBlank())
                    .map(option -> toOptionEntity(option, question))
                    .toList();
            question.getOptionItems().addAll(optionItems);
            question.setOptions(optionsToJson(optionItems));
        }

        FormQuestion saved = questionRepository.save(question);
        return FormQuestionDTO.fromQuestion(saved);
    }

    @Transactional
    public void deleteQuestion(UUID questionId) {
        FormQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        questionRepository.delete(question);
    }

    @Transactional
    public FormQuestionOptionDTO createOption(UUID questionId, CreateQuestionOptionRequest request) {
        FormQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        FormQuestionOption option = toOptionEntity(request, question);
        FormQuestionOption saved = optionRepository.save(option);
        return FormQuestionOptionDTO.fromOption(saved);
    }

    @Transactional
    public FormQuestionOptionDTO updateOption(UUID optionId, UpdateQuestionOptionRequest request) {
        FormQuestionOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        if (request.getOptionText() != null) {
            option.setOptionText(request.getOptionText());
        }
        option.setOptionValue(request.getOptionValue());
        option.setOptionOrder(request.getOptionOrder());
        option.setPoints(request.getPoints());

        FormQuestionOption saved = optionRepository.save(option);
        return FormQuestionOptionDTO.fromOption(saved);
    }

    @Transactional
    public void deleteOption(UUID optionId) {
        FormQuestionOption option = optionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));
        optionRepository.delete(option);
    }

    // ===== REORDERING METHODS FOR DRAG & DROP =====
    
    /**
     * Reorder questions within a section
     */
    @Transactional
    public void reorderQuestions(ReorderQuestionsRequest request) {
        FormSection section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));
        
        for (ReorderQuestionsRequest.QuestionOrder order : request.getQuestionOrders()) {
            FormQuestion question = questionRepository.findById(order.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found: " + order.getQuestionId()));
            
            if (!question.getSection().getSectionId().equals(request.getSectionId())) {
                throw new RuntimeException("Question does not belong to specified section");
            }
            
            question.setQuestionOrder(order.getNewOrder());
            questionRepository.save(question);
        }
    }
    
    /**
     * Reorder sections within a form
     */
    @Transactional
    public void reorderSections(ReorderSectionsRequest request) {
        DiagnosticForm form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        for (ReorderSectionsRequest.SectionOrder order : request.getSectionOrders()) {
            FormSection section = sectionRepository.findById(order.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Section not found: " + order.getSectionId()));
            
            if (!section.getForm().getFormId().equals(request.getFormId())) {
                throw new RuntimeException("Section does not belong to specified form");
            }
            
            section.setSectionOrder(order.getNewOrder());
            sectionRepository.save(section);
        }
    }

    private FormQuestionOption toOptionEntity(CreateQuestionOptionRequest request, FormQuestion question) {
        FormQuestionOption option = new FormQuestionOption();
        option.setQuestion(question);
        option.setOptionText(request.getOptionText());
        option.setOptionValue(request.getOptionValue());
        option.setOptionOrder(request.getOptionOrder());
        option.setPoints(request.getPoints());
        return option;
    }

    private String optionsToJson(List<FormQuestionOption> optionItems) {
        List<String> labels = optionItems.stream()
                .map(FormQuestionOption::getOptionText)
                .filter(label -> label != null)
                .toList();
        return labels.stream()
                .map(label -> "\"" + label.replace("\\", "\\\\").replace("\"", "\\\"") + "\"")
                .collect(java.util.stream.Collectors.joining(",", "[", "]"));
    }

    private String generateQuestionCode(String requestedCode) {
        if (requestedCode != null && !requestedCode.isBlank()) {
            return requestedCode;
        }
        return "Q" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private DiagnosticForm.FormStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return DiagnosticForm.FormStatus.DRAFT;
        }
        try {
            return DiagnosticForm.FormStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return DiagnosticForm.FormStatus.DRAFT;
        }
    }

    public Map<String, Object> getLatestPatientData(UUID patientId) {
        // Lấy danh sách câu trả lời mới nhất
        List<AssessmentAnswer> latestAnswers = answerRepository.findLatestAnswersByPatientId(patientId);
        
        Map<String, Object> profile = new HashMap<>();
        for (AssessmentAnswer ans : latestAnswers) {
            if (ans.getQuestionCode() != null && ans.getAnswerValue() != null) {
                // Chuẩn hóa: Viết hoa mã Code và bỏ khoảng trắng thừa
                String code = ans.getQuestionCode().trim().toUpperCase();
                String value = ans.getAnswerValue().trim();
                profile.put(code, value);
            }
        }
        // In ra màn hình đen (Console) để bạn xem Backend thực sự trả về gì
        System.out.println("DEBUG - Dữ liệu trả về cho Frontend: " + profile);
        return profile;
    }
    
    // ===== NEW: VERSIONING MANAGEMENT =====
    
    /**
     * Publish a draft version to make it live for new submissions
     */
    @Transactional
    public FormVersion publishVersion(UUID versionId) throws Exception {
        FormVersion version = formVersionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Form version not found"));
        
        if (!version.getStatus().equals(FormVersion.VersionStatus.DRAFT)) {
            throw new RuntimeException("Cannot publish non-draft version");
        }
        
        // Deprecate previous version
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
        
        formRepository.save(form);
        return formVersionRepository.save(version);
    }
    
    /**
     * Get version history for a form
     */
    @Transactional(readOnly = true)
    public List<FormVersion> getFormVersionHistory(UUID formId) {
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
    
    // ===== CONDITIONAL LOGIC MANAGEMENT =====
    
    /**
     * Add a conditional rule to a question
     */
    @Transactional
    public QuestionCondition addCondition(UUID questionId, String conditionType, String rulesJson, Integer priority) {
        FormQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        
        QuestionCondition condition = new QuestionCondition();
        condition.setConditionId(UUID.randomUUID());
        condition.setQuestion(question);
        condition.setConditionType(conditionType);
        condition.setConditionRulesJson(rulesJson);
        condition.setPriority(priority != null ? priority : 0);
        condition.setEnabled(true);
        
        return conditionalLogicService.getConditionsForQuestion(questionId).isEmpty() ? 
                condition : condition; // Just for demonstration
    }
}
