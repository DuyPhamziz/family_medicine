package com.familymed.form.service;

import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.FormSection;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.repository.FormSectionRepository;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentExportService {

    private static final int EXCEL_SHEET_NAME_LIMIT = 31;
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final DiagnosticFormRepository formRepository;
    private final FormSectionRepository sectionRepository;
    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;

    public void exportFormsToExcel(List<UUID> formIds, OutputStream outputStream) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            int sheetIndex = 1;
            for (UUID formId : formIds) {
                DiagnosticForm form = formRepository.findById(formId)
                        .orElseThrow(() -> new RuntimeException("Form not found"));

                String sheetName = buildSheetName(form.getFormName(), sheetIndex++);
                Sheet sheet = workbook.createSheet(sheetName);

                List<FormQuestion> orderedQuestions = loadOrderedQuestions(formId);
                List<AssessmentSession> sessions = sessionRepository.findByFormFormIdOrderByStartedAtAsc(formId);

                Map<UUID, Map<UUID, AssessmentAnswer>> latestAnswers = loadLatestAnswers(sessions);
                writeSheet(sheet, orderedQuestions, sessions, latestAnswers);
            }

            workbook.write(outputStream);
        }
    }

    private List<FormQuestion> loadOrderedQuestions(UUID formId) {
        List<FormSection> sections = sectionRepository.findByForm_FormIdOrderBySectionOrder(formId);
        return sections.stream()
                .flatMap(section -> {
                    List<FormQuestion> questions = section.getQuestions();
                    if (questions == null) {
                        return List.<FormQuestion>of().stream();
                    }
                    return questions.stream()
                            .sorted((a, b) -> Integer.compare(
                                    a.getQuestionOrder() == null ? 0 : a.getQuestionOrder(),
                                    b.getQuestionOrder() == null ? 0 : b.getQuestionOrder()));
                })
                .collect(Collectors.toList());
    }

    private Map<UUID, Map<UUID, AssessmentAnswer>> loadLatestAnswers(List<AssessmentSession> sessions) {
        Map<UUID, Map<UUID, AssessmentAnswer>> latestAnswers = new HashMap<>();
        List<UUID> sessionIds = sessions.stream().map(AssessmentSession::getSessionId).toList();
        if (sessionIds.isEmpty()) {
            return latestAnswers;
        }

        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdIn(sessionIds);
        for (AssessmentAnswer answer : answers) {
            latestAnswers
                    .computeIfAbsent(answer.getSession().getSessionId(), key -> new LinkedHashMap<>())
                    .merge(answer.getQuestionId(), answer, (existing, incoming) ->
                            incoming.getAnsweredAt().isAfter(existing.getAnsweredAt()) ? incoming : existing);
        }

        return latestAnswers;
    }

    private void writeSheet(
            Sheet sheet,
            List<FormQuestion> questions,
            List<AssessmentSession> sessions,
            Map<UUID, Map<UUID, AssessmentAnswer>> latestAnswers) {
        int rowIndex = 0;

        Row headerRow = sheet.createRow(rowIndex++);
        List<String> headers = buildHeaders(questions);
        for (int i = 0; i < headers.size(); i++) {
            headerRow.createCell(i).setCellValue(headers.get(i));
        }

        for (AssessmentSession session : sessions) {
            Row row = sheet.createRow(rowIndex++);
            List<String> metadata = buildMetadata(session);
            int cellIndex = 0;
            for (String value : metadata) {
                row.createCell(cellIndex++).setCellValue(value);
            }

            Map<UUID, AssessmentAnswer> sessionAnswers = latestAnswers.getOrDefault(session.getSessionId(), Map.of());
            for (FormQuestion question : questions) {
                AssessmentAnswer answer = sessionAnswers.get(question.getQuestionId());
                String displayValue = answer == null ? "" : formatAnswer(answer);
                row.createCell(cellIndex++).setCellValue(displayValue);
            }
        }

        for (int i = 0; i < headers.size(); i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private List<String> buildHeaders(List<FormQuestion> questions) {
        List<String> headers = new ArrayList<>();
        headers.add("session_id");
        headers.add("patient_code");
        headers.add("patient_name");
        headers.add("patient_dob");
        headers.add("doctor_email");
        headers.add("status");
        headers.add("started_at");
        headers.add("completed_at");
        headers.add("notes");

        for (FormQuestion question : questions) {
            String code = question.getQuestionCode();
            String text = question.getQuestionText();
            String header = (code == null || code.isBlank()) ? text : code + " - " + text;
            headers.add(header == null ? "" : header);
        }

        return headers;
    }

    private List<String> buildMetadata(AssessmentSession session) {
        List<String> metadata = new ArrayList<>();
        metadata.add(session.getSessionId() == null ? "" : session.getSessionId().toString());
        metadata.add(session.getPatient() == null ? "" : safeString(session.getPatient().getPatientCode()));
        metadata.add(session.getPatient() == null ? "" : safeString(session.getPatient().getFullName()));
        metadata.add(session.getPatient() == null || session.getPatient().getDateOfBirth() == null
                ? ""
                : session.getPatient().getDateOfBirth().toString());
        metadata.add(session.getDoctor() == null ? "" : safeString(session.getDoctor().getEmail()));
        metadata.add(session.getStatus() == null ? "" : session.getStatus().name());
        metadata.add(session.getStartedAt() == null ? "" : session.getStartedAt().format(DATE_TIME_FORMAT));
        metadata.add(session.getCompletedAt() == null ? "" : session.getCompletedAt().format(DATE_TIME_FORMAT));
        metadata.add(session.getNotes() == null ? "" : session.getNotes());
        return metadata;
    }

    private String formatAnswer(AssessmentAnswer answer) {
        return switch (answer.getAnswerType()) {
            case BOOLEAN -> "true".equalsIgnoreCase(answer.getAnswerValue()) ? "Yes" : "No";
            case MULTIPLE_CHOICE -> formatMultiChoice(answer.getAnswerValue());
            case NUMBER, TEXT, SINGLE_CHOICE, DATE , IMAGE_UPLOAD -> safeString(answer.getAnswerValue());
            
        };
    }

    private String formatMultiChoice(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            String inner = trimmed.substring(1, trimmed.length() - 1).trim();
            if (inner.isEmpty()) {
                return "";
            }
            return inner.replace("\"", "").replace("\\", "");
        }
        return value;
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }

    private String buildSheetName(String formName, int fallbackIndex) {
        String base = formName == null || formName.isBlank()
                ? "Form " + fallbackIndex
                : formName;
        String sanitized = base.replaceAll("[\\\\/:?*\\[\\]]", "-");
        if (sanitized.length() > EXCEL_SHEET_NAME_LIMIT) {
            sanitized = sanitized.substring(0, EXCEL_SHEET_NAME_LIMIT);
        }
        return sanitized;
    }
}
