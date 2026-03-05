package com.familymed.form.service;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormQuestionDTO;
import com.familymed.form.dto.publicapi.PublicFormSectionDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PublicFormService {

    private final DiagnosticFormRepository formRepository;
    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;
    private final FormulaEvaluationService formulaEvaluationService;
    private final PublicFormAntiSpamService antiSpamService;
    private final FormPublishWorkflowService publishWorkflowService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<PublicFormSummaryDTO> getPublicForms() {
        return formRepository.findByStatusAndIsPublicTrue(DiagnosticForm.FormStatus.PUBLISHED)
                .stream()
                .filter(form -> form.getPublicToken() != null)
                .filter(form -> form.getPublishedVersionId() != null)
                .map(form -> PublicFormSummaryDTO.builder()
                        .title(form.getFormName())
                        .description(form.getDescription())
                        .category(form.getCategory())
                        .estimatedTime(form.getEstimatedTime())
                        .iconColor(form.getIconColor())
                        .version(form.getVersion())
                        .publicToken(form.getPublicToken())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicFormDetailDTO getPublicForm(UUID publicToken) {
        DiagnosticForm form = findPublishedPublicForm(publicToken);
        return publishWorkflowService.getPublishedForm(form.getFormId());
    }

    @Transactional
    public Map<String, Object> submitPublicForm(UUID publicToken, PublicFormSubmitRequest request, String clientIp) {
        DiagnosticForm form = findPublishedPublicForm(publicToken);
        PublicFormDetailDTO publishedSchema = publishWorkflowService.getPublishedForm(form.getFormId());

        UUID submissionId = UUID.randomUUID();

        antiSpamService.validateAndRecordSubmission(
                request.getSessionToken(),
                form.getFormId(),
                clientIp,
                request.getHoneypot(),
                submissionId
        );

        Map<String, Object> answers = new LinkedHashMap<>();
        if (request.getAnswers() != null) {
            answers.putAll(request.getAnswers());
        }

        applyFormulaValues(publishedSchema, answers);

        PatientFormSubmission submission = new PatientFormSubmission();
        submission.setSubmissionId(submissionId);
        submission.setForm(form);
        submission.setFormVersionNumber(publishedSchema.getVersion());
        submission.setPatientName(request.getPatientName());
        submission.setPhone(request.getPhone());
        submission.setEmail(request.getEmail());
        submission.setSubmissionData(toJson(answers));
        submission.setFormSnapshot(buildFormSnapshot(publishedSchema, answers));
        submission.setStatus(PatientFormSubmission.SubmissionStatus.PENDING);

        PatientFormSubmission saved = submissionRepository.save(submission);
        saveAnswerRows(saved, form.getFormId(), answers);

        return Map.of(
                "submissionId", saved.getSubmissionId(),
                "status", saved.getStatus().name(),
                "message", "Form submitted successfully"
        );
    }

    public UUID getFormIdByToken(UUID publicToken) {
        return findPublishedPublicForm(publicToken).getFormId();
    }

    @Transactional(readOnly = true)
    public PublicFormDetailDTO getPublishedFormById(UUID formId) {
        return publishWorkflowService.getPublishedForm(formId);
    }

    private DiagnosticForm findPublishedPublicForm(UUID publicToken) {
        DiagnosticForm form = formRepository.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Public form not found"));

        if (!Boolean.TRUE.equals(form.getIsPublic()) || form.getStatus() != DiagnosticForm.FormStatus.PUBLISHED) {
            throw new RuntimeException("Form is not publicly available");
        }
        if (form.getPublishedVersionId() == null) {
            throw new RuntimeException("Published form snapshot not found");
        }

        return form;
    }

    private void applyFormulaValues(PublicFormDetailDTO schema, Map<String, Object> answers) {
        List<PublicFormQuestionDTO> questions = flattenQuestions(schema);
        if (questions.isEmpty()) {
            return;
        }

        for (int pass = 0; pass < 3; pass++) {
            boolean changed = false;

            for (PublicFormQuestionDTO question : questions) {
                if (question.getFormulaExpression() == null || question.getFormulaExpression().isBlank()) {
                    continue;
                }
                if (question.getQuestionCode() == null || question.getQuestionCode().isBlank()) {
                    continue;
                }

                Object result = formulaEvaluationService.evaluate(question.getFormulaExpression(), answers);
                if (result == null) {
                    continue;
                }

                Object currentValue = answers.get(question.getQuestionCode());
                if (currentValue == null || !String.valueOf(currentValue).equals(String.valueOf(result))) {
                    answers.put(question.getQuestionCode(), result);
                    changed = true;
                }
            }

            if (!changed) {
                break;
            }
        }
    }

    private List<PublicFormQuestionDTO> flattenQuestions(PublicFormDetailDTO schema) {
        if (schema == null || schema.getSections() == null) {
            return List.of();
        }

        List<PublicFormQuestionDTO> result = new ArrayList<>();
        for (PublicFormSectionDTO section : schema.getSections()) {
            if (section.getQuestions() != null) {
                result.addAll(section.getQuestions());
            }
        }
        return result;
    }

    private void saveAnswerRows(PatientFormSubmission submission, UUID formId, Map<String, Object> answers) {
        if (answers.isEmpty()) {
            return;
        }

        Map<String, UUID> questionCodeMap = publishWorkflowService.getPublishedQuestionCodeMap(formId);
        List<SubmissionAnswer> answerRows = new ArrayList<>();

        answers.forEach((questionCode, value) -> {
            SubmissionAnswer answer = new SubmissionAnswer();
            answer.setAnswerId(UUID.randomUUID());
            answer.setSubmission(submission);
            answer.setQuestionCode(questionCode);
            answer.setQuestionId(questionCodeMap.get(questionCode));
            answer.setValue(value == null ? null : serializeAnswerValue(value));
            answerRows.add(answer);
        });

        submissionAnswerRepository.saveAll(answerRows);
    }

    private String buildFormSnapshot(PublicFormDetailDTO schema, Map<String, Object> answers) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("publicToken", schema.getPublicToken());
        snapshot.put("title", schema.getTitle());
        snapshot.put("description", schema.getDescription());
        snapshot.put("category", schema.getCategory());
        snapshot.put("version", schema.getVersion());
        snapshot.put("sections", schema.getSections());
        snapshot.put("answers", answers);
        return toJson(snapshot);
    }

    private String serializeAnswerValue(Object value) {
        if (value instanceof String || value instanceof Number || value instanceof Boolean) {
            return String.valueOf(value);
        }
        return toJson(value);
    }

    private String toJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new RuntimeException("Cannot serialize JSON", e);
        }
    }
}
