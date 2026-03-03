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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
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
        exportFormsToExcel(formIds, outputStream, null);
    }

    public void exportFormsToExcel(List<UUID> formIds, OutputStream outputStream, UUID patientId) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Process each form - for single form, create 3 sheets; for multiple, create per-form sheets
            for (UUID formId : formIds) {
                DiagnosticForm form = formRepository.findById(formId)
                        .orElseThrow(() -> new RuntimeException("Form not found"));

                List<FormQuestion> questions = loadOrderedQuestions(formId);
                
                // Find sessions (latest or for specific patient)
                List<AssessmentSession> sessions = findSessions(formId, patientId);
                if (sessions.isEmpty()) {
                    // No sessions - create empty info sheet
                    createEmptySheet(workbook, form);
                    continue;
                }

                // For single session: create 3 sheets
                if (sessions.size() == 1) {
                    AssessmentSession session = sessions.get(0);
                    Map<UUID, AssessmentAnswer> answers = loadAnswersForSession(session.getSessionId());
                    
                    createSessionInfoSheet(workbook, session, form);
                    createSessionResultSheet(workbook, questions, answers);
                    createSessionAssessmentSheet(workbook, session, questions, answers);
                } else {
                    // Multiple sessions: create summary sheet with all sessions
                    Map<UUID, Map<UUID, AssessmentAnswer>> allAnswers = loadLatestAnswers(sessions);
                    createSummarySheet(workbook, form, questions, sessions, allAnswers);
                }
            }

            workbook.write(outputStream);
        }
    }

    private List<AssessmentSession> findSessions(UUID formId, UUID patientId) {
        if (patientId != null) {
            var maybeCompleted = sessionRepository.findFirstByPatientPatientIdAndFormFormIdAndStatusOrderByUpdatedAtDesc(
                    patientId, formId, AssessmentSession.SessionStatus.COMPLETED);
            if (maybeCompleted.isPresent()) {
                return List.of(maybeCompleted.get());
            }
            
            var maybeAny = sessionRepository.findFirstByPatientPatientIdAndFormFormIdAndStatusOrderByUpdatedAtDesc(
                    patientId, formId, AssessmentSession.SessionStatus.IN_PROGRESS);
            if (maybeAny.isPresent()) {
                return List.of(maybeAny.get());
            }
            
            return List.of();
        } else {
            return sessionRepository.findByFormFormIdOrderByStartedAtAsc(formId);
        }
    }

    private void createEmptySheet(Workbook workbook, DiagnosticForm form) {
        Sheet sheet = workbook.createSheet(buildSheetName(form.getFormName(), 1));
        Row row = sheet.createRow(0);
        row.createCell(0).setCellValue("Không có dữ liệu");
    }

    private void createSessionInfoSheet(Workbook workbook, AssessmentSession session, DiagnosticForm form) {
        Sheet sheet = workbook.createSheet("THONG_TIN_BENH_NHAN");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 18000);

        int rowIndex = 0;

        // Hospital header
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        hospitalCell.setCellValue("BỆNH VIỆN ĐA KHOA");
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space

        // Form title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THÔNG TIN BỆNH NHÂN - " + (form.getFormName() != null ? form.getFormName() : "BIỂU MẪU"));
        CellStyle titleStyle = createTitleStyle(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space
        rowIndex++; // Space

        CellStyle labelStyle = createLabelStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        // Patient information section
        addSectionHeader(sheet, workbook, rowIndex++, "THÔNG TIN BỆNH NHÂN", labelStyle);

        if (session.getPatient() != null) {
            addInfoRowStyled(sheet, workbook, rowIndex++, "Họ tên:", session.getPatient().getFullName(), labelStyle, dataStyle);
            addInfoRowStyled(sheet, workbook, rowIndex++, "Mã bệnh nhân:", session.getPatient().getPatientCode(), labelStyle, dataStyle);
            
            if (session.getPatient().getDateOfBirth() != null) {
                addInfoRowStyled(sheet, workbook, rowIndex++, "Ngày sinh:", 
                        session.getPatient().getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), labelStyle, dataStyle);
            }
            
            if (session.getPatient().getGender() != null) {
                addInfoRowStyled(sheet, workbook, rowIndex++, "Giới tính:", session.getPatient().getGender().toString(), labelStyle, dataStyle);
            }
        }

        rowIndex++; // Space

        // Assessment session section
        addSectionHeader(sheet, workbook, rowIndex++, "THÔNG TIN KHÁM CLS", labelStyle);

        if (form.getFormName() != null) {
            addInfoRowStyled(sheet, workbook, rowIndex++, "Loại biểu mẫu:", form.getFormName(), labelStyle, dataStyle);
        }

        if (session.getStartedAt() != null) {
            addInfoRowStyled(sheet, workbook, rowIndex++, "Ngày khám:", 
                    session.getStartedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), labelStyle, dataStyle);
        }

        if (session.getDoctor() != null && session.getDoctor().getFullName() != null) {
            addInfoRowStyled(sheet, workbook, rowIndex++, "Bác sĩ khám:", session.getDoctor().getFullName(), labelStyle, dataStyle);
        }

        addInfoRowStyled(sheet, workbook, rowIndex++, "Trạng thái:", 
                session.getStatus() != null ? session.getStatus().name() : "-", labelStyle, dataStyle);

        if (session.getCompletedAt() != null) {
            addInfoRowStyled(sheet, workbook, rowIndex++, "Hoàn thành lúc:",
                    session.getCompletedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), labelStyle, dataStyle);
        }

        rowIndex++; // Space

        // Notes section
        if (session.getNotes() != null && !session.getNotes().isBlank()) {
            addSectionHeader(sheet, workbook, rowIndex++, "GHI CHÚ", labelStyle);
            Row noteRow = sheet.createRow(rowIndex++);
            Cell noteCell = noteRow.createCell(1);
            noteCell.setCellValue(session.getNotes());
            noteCell.setCellStyle(createWrapStyle(workbook));
        }
    }

    private void createSessionResultSheet(Workbook workbook, List<FormQuestion> questions, 
                                          Map<UUID, AssessmentAnswer> answers) {
        Sheet sheet = workbook.createSheet("KET_QUA_KHAM");
        sheet.setColumnWidth(0, 2000);  // STT
        sheet.setColumnWidth(1, 20000); // Câu hỏi
        sheet.setColumnWidth(2, 10000); // Đáp án
        sheet.setColumnWidth(3, 6000);  // Đơn vị

        int rowIndex = 0;

        // Hospital header
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        hospitalCell.setCellValue("BỆNH VIỆN ĐA KHOA");
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 3));

        rowIndex++; // Space

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("KẾT QUẢ KHÁM CLS - CHI TIẾT CÁC HẠNG MỤC");
        CellStyle titleStyle = createTitleStyle(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 3));

        rowIndex++; // Space

        // Header
        Row headerRow = sheet.createRow(rowIndex++);
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        addHeaderCell(headerRow, 0, "STT", headerStyle);
        addHeaderCell(headerRow, 1, "Câu hỏi / Hạng mục", headerStyle);
        addHeaderCell(headerRow, 2, "Đáp án", headerStyle);
        addHeaderCell(headerRow, 3, "Đơn vị", headerStyle);

        CellStyle dataStyle = createDataStyle(workbook);
        CellStyle answerStyle = createAnswerStyle(workbook);

        // Data rows
        int stt = 1;
        for (FormQuestion question : questions) {
            AssessmentAnswer answer = answers.get(question.getQuestionId());
            if (answer == null || answer.getAnswerValue() == null || answer.getAnswerValue().isBlank()) {
                continue; // Skip unanswered
            }

            Row row = sheet.createRow(rowIndex++);
            
            Cell sttCell = row.createCell(0);
            sttCell.setCellValue(stt++);
            sttCell.setCellStyle(dataStyle);
            
            Cell qCell = row.createCell(1);
            qCell.setCellValue(question.getQuestionText() != null ? question.getQuestionText() : "");
            qCell.setCellStyle(dataStyle);
            
            Cell aCell = row.createCell(2);
            aCell.setCellValue(formatAnswer(answer));
            aCell.setCellStyle(answerStyle);
            
            Cell unitCell = row.createCell(3);
            unitCell.setCellValue(question.getUnit() != null ? question.getUnit() : "");
            unitCell.setCellStyle(dataStyle);
        }
    }

    private void createSessionAssessmentSheet(Workbook workbook, AssessmentSession session, 
                                              List<FormQuestion> questions, Map<UUID, AssessmentAnswer> answers) {
        Sheet sheet = workbook.createSheet("DANH_GIA_SO_BO");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 18000);

        int rowIndex = 0;

        // Hospital header
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        hospitalCell.setCellValue("BỆNH VIỆN ĐA KHOA");
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("ĐÁNH GIÁ SƠ BỘ - KẾT LUẬN");
        CellStyle titleStyle = createTitleStyle(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space
        rowIndex++; // Space

        CellStyle labelStyle = createLabelStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        // Status
        addInfoRowStyled(sheet, workbook, rowIndex++, "Tình trạng:", 
                session.getStatus() != null ? session.getStatus().name() : "-", labelStyle, dataStyle);

        addInfoRowStyled(sheet, workbook, rowIndex++, "Ngày khám:", 
                session.getStartedAt() != null ? 
                session.getStartedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) : "-", labelStyle, dataStyle);

        rowIndex++; // Space

        // Conclusion section
        addSectionHeader(sheet, workbook, rowIndex++, "KẾT LUẬN / NHẬN XÉT CLS", labelStyle);

        if (session.getNotes() != null && !session.getNotes().isBlank()) {
            Row noteRow = sheet.createRow(rowIndex++);
            Cell noteCell = noteRow.createCell(1);
            noteCell.setCellValue(session.getNotes());
            CellStyle wrapStyle = createWrapStyle(workbook);
            noteCell.setCellStyle(wrapStyle);
        } else {
            Row noteRow = sheet.createRow(rowIndex++);
            Cell noteCell = noteRow.createCell(1);
            noteCell.setCellValue("Chưa có nhận xét");
        }
    }

    private void createSummarySheet(Workbook workbook, DiagnosticForm form, List<FormQuestion> questions,
                                    List<AssessmentSession> sessions, Map<UUID, Map<UUID, AssessmentAnswer>> allAnswers) {
        Sheet sheet = workbook.createSheet("TAT_CA_PHIEN");
        sheet.setColumnWidth(0, 2000);  // STT
        sheet.setColumnWidth(1, 5000);  // Mã bệnh nhân
        sheet.setColumnWidth(2, 8000);  // Họ tên
        sheet.setColumnWidth(3, 12000); // Trạng thái
        sheet.setColumnWidth(4, 8000);  // Ngày khám

        int rowIndex = 0;

        // Header
        Row headerRow = sheet.createRow(rowIndex++);
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        addHeaderCell(headerRow, 0, "STT", headerStyle);
        addHeaderCell(headerRow, 1, "Mã BN", headerStyle);
        addHeaderCell(headerRow, 2, "Bệnh nhân", headerStyle);
        addHeaderCell(headerRow, 3, "Trạng thái", headerStyle);
        addHeaderCell(headerRow, 4, "Ngày khám", headerStyle);

        CellStyle dataStyle = createDataStyle(workbook);

        // Data rows
        int stt = 1;
        for (AssessmentSession session : sessions) {
            Row row = sheet.createRow(rowIndex++);
            
            createStyledCell(row, 0, String.valueOf(stt++), dataStyle);
            createStyledCell(row, 1, session.getPatient() != null ? session.getPatient().getPatientCode() : "-", dataStyle);
            createStyledCell(row, 2, session.getPatient() != null ? session.getPatient().getFullName() : "-", dataStyle);
            createStyledCell(row, 3, session.getStatus() != null ? session.getStatus().name() : "-", dataStyle);
            createStyledCell(row, 4, session.getStartedAt() != null ? 
                    session.getStartedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "-", dataStyle);
        }
    }

    // Helper Methods
    private Map<UUID, AssessmentAnswer> loadAnswersForSession(UUID sessionId) {
        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdOrderByAnsweredAtDesc(sessionId);
        Map<UUID, AssessmentAnswer> latestByQuestion = new LinkedHashMap<>();
        for (AssessmentAnswer answer : answers) {
            if (!latestByQuestion.containsKey(answer.getQuestionId())) {
                latestByQuestion.put(answer.getQuestionId(), answer);
            }
        }
        return latestByQuestion;
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

    private String formatAnswer(AssessmentAnswer answer) {
        if (answer == null || answer.getAnswerValue() == null) return "";
        return switch (answer.getAnswerType()) {
            case BOOLEAN -> "true".equalsIgnoreCase(answer.getAnswerValue()) ? "Có" : "Không";
            case MULTIPLE_CHOICE -> answer.getAnswerValue().replace("[", "").replace("]", "").replace("\"", "");
            default -> answer.getAnswerValue();
        };
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createLabelStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short)11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createHospitalHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short)14);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short)12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createAnswerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setColor(IndexedColors.BLUE.getIndex());
        style.setFont(font);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setWrapText(true);
        return style;
    }

    private CellStyle createWrapStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        return style;
    }

    private void addSectionHeader(Sheet sheet, Workbook workbook, int rowIndex, String sectionName, CellStyle style) {
        Row row = sheet.createRow(rowIndex);
        Cell cell = row.createCell(0);
        cell.setCellValue(sectionName);
        Cell borderCell = row.createCell(1);
        
        CellStyle sectionStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short)11);
        sectionStyle.setFont(font);
        sectionStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        sectionStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        sectionStyle.setBorderBottom(BorderStyle.MEDIUM);
        
        cell.setCellStyle(sectionStyle);
        borderCell.setCellStyle(sectionStyle);
    }

    private void addInfoRow(Sheet sheet, Workbook workbook, int rowIndex, String label, String value, CellStyle labelStyle) {
        Row row = sheet.createRow(rowIndex);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value != null ? value : "-");
    }

    private void addInfoRowStyled(Sheet sheet, Workbook workbook, int rowIndex, String label, String value, CellStyle labelStyle, CellStyle dataStyle) {
        Row row = sheet.createRow(rowIndex);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value != null ? value : "-");
        valueCell.setCellStyle(dataStyle);
    }

    private void addHeaderCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void createStyledCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "-");
        cell.setCellStyle(style);
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
