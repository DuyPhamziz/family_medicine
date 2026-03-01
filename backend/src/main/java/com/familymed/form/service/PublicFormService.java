package com.familymed.form.service;

import com.familymed.form.dto.publicapi.*;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormQuestionOption;
import com.familymed.form.entity.FormSection;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormQuestionRepository;
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
    private final FormQuestionRepository questionRepository;
    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<PublicFormSummaryDTO> getPublicForms() {
        return formRepository.findByStatusAndIsPublicTrue(DiagnosticForm.FormStatus.PUBLISHED)
                .stream()
                .filter(form -> form.getPublicToken() != null)
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

        List<PublicFormSectionDTO> sections = form.getSections() == null
                ? List.of()
                : form.getSections().stream()
                .sorted(Comparator.comparing(FormSection::getSectionOrder))
                .map(this::toSectionDto)
                .toList();

        return PublicFormDetailDTO.builder()
                .publicToken(form.getPublicToken())
                .title(form.getFormName())
                .description(form.getDescription())
                .category(form.getCategory())
                .version(form.getVersion())
                .sections(sections)
                .build();
    }

    @Transactional
    public Map<String, Object> submitPublicForm(UUID publicToken, PublicFormSubmitRequest request) {
        DiagnosticForm form = findPublishedPublicForm(publicToken);

        Map<String, Object> answers = request.getAnswers() == null ? Map.of() : request.getAnswers();
        String answersJson = toJson(answers);

        PatientFormSubmission submission = new PatientFormSubmission();
        submission.setSubmissionId(UUID.randomUUID());
        submission.setForm(form);
        submission.setFormVersionNumber(form.getVersion());
        submission.setPatientName(request.getPatientName());
        submission.setPhone(request.getPhone());
        submission.setEmail(request.getEmail());
        submission.setSubmissionData(answersJson);
        submission.setFormSnapshot(buildFormSnapshot(form, answers));
        submission.setStatus(PatientFormSubmission.SubmissionStatus.PENDING);

        PatientFormSubmission saved = submissionRepository.save(submission);

        saveAnswerRows(saved, form, answers);

        return Map.of(
                "submissionId", saved.getSubmissionId(),
                "status", saved.getStatus().name(),
                "message", "Form submitted successfully"
        );
    }

    private DiagnosticForm findPublishedPublicForm(UUID publicToken) {
        DiagnosticForm form = formRepository.findByPublicToken(publicToken)
                .orElseThrow(() -> new RuntimeException("Public form not found"));

        if (!Boolean.TRUE.equals(form.getIsPublic()) || form.getStatus() != DiagnosticForm.FormStatus.PUBLISHED) {
            throw new RuntimeException("Form is not publicly available");
        }

        return form;
    }

    private PublicFormSectionDTO toSectionDto(FormSection section) {
        List<PublicFormQuestionDTO> questions = section.getQuestions() == null
                ? List.of()
                : section.getQuestions().stream()
                .sorted(Comparator.comparing(FormQuestion::getQuestionOrder))
                .map(this::toQuestionDto)
                .toList();

        return PublicFormSectionDTO.builder()
                .sectionName(section.getSectionName())
                .sectionOrder(section.getSectionOrder())
                .questions(questions)
                .build();
    }

    private PublicFormQuestionDTO toQuestionDto(FormQuestion question) {
        List<PublicFormOptionDTO> options = question.getOptionItems() == null
                ? List.of()
                : question.getOptionItems().stream()
                .sorted(Comparator.comparing(FormQuestionOption::getOptionOrder, Comparator.nullsLast(Integer::compareTo)))
                .map(option -> PublicFormOptionDTO.builder()
                        .text(option.getOptionText())
                        .value(option.getOptionValue())
                        .build())
                .toList();

        return PublicFormQuestionDTO.builder()
                .questionCode(question.getQuestionCode())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType() != null ? question.getQuestionType().name() : null)
                .required(Boolean.TRUE.equals(question.getRequired()))
                .helpText(question.getHelpText())
                .minValue(question.getMinValue())
                .maxValue(question.getMaxValue())
                .unit(question.getUnit())
                .options(options)
                .build();
    }

    private void saveAnswerRows(PatientFormSubmission submission, DiagnosticForm form, Map<String, Object> answers) {
        if (answers.isEmpty()) {
            return;
        }

        Map<String, UUID> questionCodeMap = questionRepository.findBySection_Form_FormId(form.getFormId())
                .stream()
                .collect(HashMap::new, (map, q) -> map.put(q.getQuestionCode(), q.getQuestionId()), HashMap::putAll);

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

    private String buildFormSnapshot(DiagnosticForm form, Map<String, Object> answers) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("publicToken", form.getPublicToken());
        snapshot.put("title", form.getFormName());
        snapshot.put("description", form.getDescription());
        snapshot.put("category", form.getCategory());
        snapshot.put("version", form.getVersion());
        snapshot.put("sections", getPublicForm(form.getPublicToken()).getSections());
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
