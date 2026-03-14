package com.familymed.form.service;

import com.familymed.form.dto.publicapi.PublicFormDetailDTO;
import com.familymed.form.dto.publicapi.PublicFormQuestionDTO;
import com.familymed.form.dto.publicapi.PublicFormSectionDTO;
import com.familymed.form.dto.publicapi.PublicFormSubmitRequest;
import com.familymed.form.dto.publicapi.PublicFormSummaryDTO;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.AnswerMatrix;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.AnswerMatrixRepository;
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
    private final AnswerMatrixRepository answerMatrixRepository;
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
        saveAnswerRows(saved, form.getFormId(), answers, publishedSchema);

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

    private void saveAnswerRows(PatientFormSubmission submission, UUID formId, Map<String, Object> answers, PublicFormDetailDTO schema) {
        if (answers.isEmpty()) {
            return;
        }

        Map<String, UUID> questionCodeMap = publishWorkflowService.getPublishedQuestionCodeMap(formId);
        Map<String, Integer> maxRepeatByQuestionCode = new HashMap<>();
        Map<String, Integer> maxRepeatByGroupId = new HashMap<>();
        Map<String, PublicFormQuestionDTO> questionByCode = new HashMap<>();
        List<PublicFormQuestionDTO> schemaQuestions = flattenQuestions(schema);

        schemaQuestions.forEach(question -> {
            if (question.getQuestionCode() != null) {
                questionByCode.put(question.getQuestionCode(), question);
            }
        });

        schemaQuestions.forEach(question -> {
            if (question.getGroupId() != null && question.getMaxRepeat() != null) {
                maxRepeatByGroupId.put(question.getGroupId(), question.getMaxRepeat());
            }
        });

        schemaQuestions.forEach(question -> {
            if (question.getQuestionCode() != null) {
                Integer maxRepeat = question.getMaxRepeat();
                if (maxRepeat == null && question.getGroupId() != null) {
                    maxRepeat = maxRepeatByGroupId.get(question.getGroupId());
                }
                maxRepeatByQuestionCode.put(question.getQuestionCode(), maxRepeat);
            }
        });

        List<SubmissionAnswer> answerRows = new ArrayList<>();

        answers.forEach((questionCode, value) -> {
            Integer maxRepeat = maxRepeatByQuestionCode.get(questionCode);

            if (isRepeatAnswerList(value)) {
                List<?> listValue = (List<?>) value;
                for (Object item : listValue) {
                    if (!(item instanceof Map<?, ?> itemMap)) {
                        continue;
                    }

                    Integer repeatIndex = readRepeatIndex(itemMap);
                    validateRepeatIndex(repeatIndex, maxRepeat, questionCode);
                    Object answerValue = itemMap.containsKey("value") ? itemMap.get("value") : itemMap.get("answerValue");
                    answerRows.add(buildAnswerRow(submission, questionCodeMap.get(questionCode), questionCode, repeatIndex, answerValue));
                }
                return;
            }

            if (value instanceof Map<?, ?> valueMap && (valueMap.containsKey("repeatIndex") || valueMap.containsKey("repeat_index"))) {
                Integer repeatIndex = readRepeatIndex(valueMap);
                validateRepeatIndex(repeatIndex, maxRepeat, questionCode);
                Object answerValue = valueMap.containsKey("value") ? valueMap.get("value") : valueMap.get("answerValue");
                answerRows.add(buildAnswerRow(submission, questionCodeMap.get(questionCode), questionCode, repeatIndex, answerValue));
                return;
            }

            PublicFormQuestionDTO schemaQuestion = questionByCode.get(questionCode);
            if (schemaQuestion != null && "MATRIX_FAMILY_DISEASE".equalsIgnoreCase(schemaQuestion.getQuestionType())) {
                saveMatrixAnswers(submission, questionCodeMap.get(questionCode), value);
            }

            answerRows.add(buildAnswerRow(submission, questionCodeMap.get(questionCode), questionCode, 0, value));
        });

        submissionAnswerRepository.saveAll(answerRows);
    }

    private SubmissionAnswer buildAnswerRow(PatientFormSubmission submission, UUID questionId, String questionCode, Integer repeatIndex, Object value) {
        SubmissionAnswer answer = new SubmissionAnswer();
        answer.setAnswerId(UUID.randomUUID());
        answer.setSubmission(submission);
        answer.setQuestionCode(questionCode);
        answer.setQuestionId(questionId);
        answer.setRepeatIndex(repeatIndex == null ? 0 : repeatIndex);
        answer.setValue(value == null ? null : serializeAnswerValue(value));
        return answer;
    }

    private boolean isRepeatAnswerList(Object value) {
        if (!(value instanceof List<?> listValue) || listValue.isEmpty()) {
            return false;
        }
        Object first = listValue.get(0);
        if (!(first instanceof Map<?, ?> firstMap)) {
            return false;
        }
        return firstMap.containsKey("repeatIndex") || firstMap.containsKey("repeat_index");
    }

    private Integer readRepeatIndex(Map<?, ?> map) {
        Object repeatIndex = map.containsKey("repeatIndex") ? map.get("repeatIndex") : map.get("repeat_index");
        if (repeatIndex == null) {
            return 0;
        }
        if (repeatIndex instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(repeatIndex));
        } catch (NumberFormatException ex) {
            throw new RuntimeException("repeat_index is invalid");
        }
    }

    private void validateRepeatIndex(Integer repeatIndex, Integer maxRepeat, String questionCode) {
        int safeRepeatIndex = repeatIndex == null ? 0 : repeatIndex;
        if (safeRepeatIndex < 0) {
            throw new RuntimeException("repeat_index must be >= 0 for question " + questionCode);
        }
        if (maxRepeat != null && safeRepeatIndex > maxRepeat) {
            throw new RuntimeException("repeat_index exceeds max_repeat for question " + questionCode);
        }
    }

    @SuppressWarnings("unchecked")
    private void saveMatrixAnswers(PatientFormSubmission submission, UUID questionId, Object value) {
        if (submission == null || questionId == null || value == null) {
            return;
        }

        Object matrixData = value;
        if (value instanceof Map<?, ?> valueMap && valueMap.containsKey("matrix")) {
            matrixData = valueMap.get("matrix");
        }

        if (!(matrixData instanceof List<?> matrixList)) {
            return;
        }

        answerMatrixRepository.deleteByResponseSubmissionIdAndQuestionId(submission.getSubmissionId(), questionId);

        List<AnswerMatrix> matrixRows = new ArrayList<>();
        for (Object rowObj : matrixList) {
            if (!(rowObj instanceof Map<?, ?> rowMap)) {
                continue;
            }

            String rowKey = getString(rowMap, "row", "row_key");
            String columnKey = getString(rowMap, "column", "column_key");
            if (rowKey == null || rowKey.isBlank() || columnKey == null || columnKey.isBlank()) {
                continue;
            }

            AnswerMatrix matrix = new AnswerMatrix();
            matrix.setResponse(submission);
            matrix.setQuestionId(questionId);
            matrix.setRowKey(rowKey);
            matrix.setColumnKey(columnKey);
            matrix.setHasDisease(getBoolean(rowMap, "has_disease", "hasDisease"));
            matrix.setDiagnosisYear(getInteger(rowMap, "diagnosis_year", "diagnosisYear", "year"));
            matrixRows.add(matrix);
        }

        if (!matrixRows.isEmpty()) {
            answerMatrixRepository.saveAll(matrixRows);
        }
    }

    private String getString(Map<?, ?> source, String... keys) {
        for (String key : keys) {
            if (source.containsKey(key) && source.get(key) != null) {
                String value = String.valueOf(source.get(key));
                if (!value.isBlank()) {
                    return value;
                }
            }
        }
        return null;
    }

    private Boolean getBoolean(Map<?, ?> source, String... keys) {
        for (String key : keys) {
            if (source.containsKey(key) && source.get(key) != null) {
                Object value = source.get(key);
                if (value instanceof Boolean boolVal) {
                    return boolVal;
                }
                return "true".equalsIgnoreCase(String.valueOf(value));
            }
        }
        return false;
    }

    private Integer getInteger(Map<?, ?> source, String... keys) {
        for (String key : keys) {
            if (source.containsKey(key) && source.get(key) != null) {
                Object value = source.get(key);
                if (value instanceof Number number) {
                    return number.intValue();
                }
                try {
                    return Integer.parseInt(String.valueOf(value));
                } catch (NumberFormatException ex) {
                    return null;
                }
            }
        }
        return null;
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
