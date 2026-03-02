package com.familymed.export.service;

import com.familymed.export.entity.HospitalTemplate;
import com.familymed.export.repository.HospitalTemplateRepository;
import com.familymed.form.entity.*;
import com.familymed.form.repository.FormQuestionRepository;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.familymed.form.service.FormCalculationEngine;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dynamic Excel Export Service
 * Xuất Excel tự động theo form template (không hardcode)
 * Hỗ trợ mọi loại form: tim mạch, nội tổng quát, nhi khoa, sản phụ khoa...
 */
@Service
@RequiredArgsConstructor
public class DynamicExcelExportService {

    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final FormQuestionRepository questionRepository;
    private final HospitalTemplateRepository templateRepository;
    private final FormCalculationEngine calculationEngine;

    /**
     * Export submission theo form template động
     * Fetch all data trước để tránh lazy loading issues
     */
    public byte[] exportSubmission(UUID submissionId) {
        try {
            // 1. Lấy submission với eager load patient + form
            PatientFormSubmission submission = submissionRepository.findByIdWithEagerLoad(submissionId)
                    .orElseThrow(() -> {
                        String errorMsg = "Submission not found (or may be deleted): " + submissionId;
                        throw new RuntimeException(errorMsg);
                    });

            // 2. Lấy answers
            List<SubmissionAnswer> answers = answerRepository.findBySubmissionSubmissionId(submissionId);
            if (answers == null || answers.isEmpty()) {
                throw new RuntimeException("No answers found for submission: " + submissionId);
            }
            
            Map<String, String> answerMap = answers.stream()
                    .filter(a -> a.getQuestionCode() != null && a.getValue() != null)
                    .collect(Collectors.toMap(
                            SubmissionAnswer::getQuestionCode,
                            SubmissionAnswer::getValue,
                            (v1, v2) -> v1
                    ));

            // 3. Lấy form
            DiagnosticForm form = submission.getForm();
            if (form == null) {
                throw new RuntimeException("Form not found for submission: " + submissionId);
            }

            // 4. Lấy questions của form (theo order)
            List<FormQuestion> questions = questionRepository.findBySection_Form_FormId(form.getFormId())
                    .stream()
                    .sorted(Comparator.comparing(FormQuestion::getQuestionOrder))
                    .collect(Collectors.toList());

            if (questions == null || questions.isEmpty()) {
                throw new RuntimeException("No questions found for form: " + form.getFormId());
            }

            // 5. Lấy hospital template
            HospitalTemplate template = templateRepository.findAll().stream()
                    .findFirst()
                    .orElse(createDefaultTemplate());

            // 6. Generate Excel
            return generateExcel(submission, form, questions, answerMap, template);
        } catch (Exception e) {
            throw new RuntimeException("Error exporting submission " + submissionId + ": " + e.getMessage(), e);
        }
    }

    private byte[] generateExcel(
            PatientFormSubmission submission,
            DiagnosticForm form,
            List<FormQuestion> questions,
            Map<String, String> answerMap,
            HospitalTemplate template
    ) {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Sheet 1: Thông tin bệnh nhân
            createPatientInfoSheet(workbook, submission, form, template);

            // Sheet 2: Kết quả khám (dynamic theo form template)
            createExaminationResultSheet(workbook, questions, answerMap, template);

            // Sheet 3: Đánh giá sơ bộ
            createAssessmentSheet(workbook, submission, questions, answerMap);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel: " + e.getMessage(), e);
        }
    }

    /**
     * Sheet 1: THONG_TIN_BENH_NHAN
     * Để hiển thị đầy đủ thông tin bệnh nhân từ submission + patient
     */
    private void createPatientInfoSheet(
            Workbook workbook,
            PatientFormSubmission submission,
            DiagnosticForm form,
            HospitalTemplate template
    ) {
        Sheet sheet = workbook.createSheet("THONG_TIN_BENH_NHAN");
        sheet.setColumnWidth(0, 8000);
        sheet.setColumnWidth(1, 15000);

        int rowIndex = 0;

        // Header: Tên bệnh viện
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        String hospitalName = template != null && template.getHospitalName() != null 
                ? template.getHospitalName() : "BỆNH VIỆN ĐA KHOA";
        hospitalCell.setCellValue(hospitalName);
        CellStyle hospitalStyle = workbook.createCellStyle();
        Font hospitalFont = workbook.createFont();
        hospitalFont.setBold(true);
        hospitalFont.setFontHeightInPoints((short) 16);
        hospitalStyle.setFont(hospitalFont);
        hospitalStyle.setAlignment(HorizontalAlignment.CENTER);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

        rowIndex++; // Empty row

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THÔNG TIN BỆNH NHÂN");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Empty row

        // Data rows - THÔNG TIN BỆNH NHÂN
        String patientName = submission.getPatientName() != null ? submission.getPatientName() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Họ tên:", patientName);
        
        // Tính tuổi nếu có DOB từ Patient object
        String ageInfo = "-";
        if (submission.getPatient() != null && submission.getPatient().getDateOfBirth() != null) {
            try {
                Integer age = calculationEngine.calculateAge(submission.getPatient().getDateOfBirth());
                ageInfo = age + " tuổi (sinh " + 
                        submission.getPatient().getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")";
            } catch (Exception e) {
                ageInfo = "-";
            }
        }
        addInfoRow(sheet, workbook, rowIndex++, "Ngày sinh:", ageInfo);
        
        // Giới tính
        String gender = "-";
        if (submission.getPatient() != null && submission.getPatient().getGender() != null) {
            try {
                gender = submission.getPatient().getGender().toString();
            } catch (Exception e) {
                gender = "-";
            }
        }
        addInfoRow(sheet, workbook, rowIndex++, "Giới tính:", gender);
        
        // Số điện thoại
        String phone = submission.getPhone() != null ? submission.getPhone() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Số điện thoại:", phone);
        
        // Email
        String email = submission.getEmail() != null ? submission.getEmail() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Email:", email);
        
        rowIndex++; // Empty row
        
        // THÔNG TIN FORM
        addInfoRow(sheet, workbook, rowIndex++, "Loại form:", form.getFormName());
        
        // Ngày nhập liệu
        String submissionDate = submission.getCreatedAt() != null 
                ? submission.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Ngày nhập liệu:", submissionDate);
        
        // Mã form submission
        addInfoRow(sheet, workbook, rowIndex++, "Mã submission:", submission.getSubmissionId().toString());
        
        // Trạng thái
        String status = submission.getStatus() != null ? submission.getStatus().toString() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Trạng thái:", status);
    }

    /**
     * Sheet 2: KET_QUA_KHAM (Dynamic theo form template)
     * Hiển thị đầy đủ tất cả các câu hỏi và câu trả lời
     */
    private void createExaminationResultSheet(
            Workbook workbook,
            List<FormQuestion> questions,
            Map<String, String> answerMap,
            HospitalTemplate template
    ) {
        Sheet sheet = workbook.createSheet("KET_QUA_KHAM");
        
        // Set column widths
        sheet.setColumnWidth(0, 2000);  // STT
        sheet.setColumnWidth(1, 12000); // Hạng mục
        sheet.setColumnWidth(2, 6000);  // Giá trị
        sheet.setColumnWidth(3, 4000);  // Đơn vị
        sheet.setColumnWidth(4, 8000);  // Ghi chú

        int rowIndex = 0;

        // Header: Tên bệnh viện
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        String hospitalName = template != null && template.getHospitalName() != null 
                ? template.getHospitalName() : "BỆNH VIỆN ĐA KHOA";
        hospitalCell.setCellValue(hospitalName);
        CellStyle hospitalStyle = workbook.createCellStyle();
        Font hospitalFont = workbook.createFont();
        hospitalFont.setBold(true);
        hospitalFont.setFontHeightInPoints((short) 16);
        hospitalStyle.setFont(hospitalFont);
        hospitalStyle.setAlignment(HorizontalAlignment.CENTER);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

        rowIndex++; // Empty row

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("KẾT QUẢ KHÁM");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 4));

        rowIndex++; // Empty row

        // Table header
        Row headerRow = sheet.createRow(rowIndex++);
        CellStyle headerStyle = createHeaderStyle(workbook);
        
        String[] headers = {"STT", "Hạng mục", "Giá trị", "Đơn vị", "Ghi chú"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows (dynamic theo questions)
        CellStyle dataStyle = createDataStyle(workbook);
        int stt = 1;
        
        if (questions != null && !questions.isEmpty()) {
            for (FormQuestion question : questions) {
                Row dataRow = sheet.createRow(rowIndex++);
                
                // STT
                Cell sttCell = dataRow.createCell(0);
                sttCell.setCellValue(stt++);
                sttCell.setCellStyle(dataStyle);
                
                // Hạng mục (questionText)
                Cell questionCell = dataRow.createCell(1);
                String questionText = question.getQuestionText() != null ? question.getQuestionText() : "";
                questionCell.setCellValue(questionText);
                questionCell.setCellStyle(dataStyle);
                
                // Giá trị (từ answerMap - lấy theo questionCode)
                Cell valueCell = dataRow.createCell(2);
                String value = "-";
                if (question.getQuestionCode() != null && answerMap.containsKey(question.getQuestionCode())) {
                    value = answerMap.get(question.getQuestionCode());
                } 
                valueCell.setCellValue(value != null ? value : "-");
                valueCell.setCellStyle(dataStyle);
                
                // Đơn vị
                Cell unitCell = dataRow.createCell(3);
                String unit = question.getUnit() != null ? question.getUnit() : "";
                unitCell.setCellValue(unit);
                unitCell.setCellStyle(dataStyle);
                
                // Ghi chú (helpText)
                Cell noteCell = dataRow.createCell(4);
                String helpText = question.getHelpText() != null ? question.getHelpText() : "";
                noteCell.setCellValue(helpText);
                noteCell.setCellStyle(dataStyle);
            }
        } else {
            // Nếu không có questions, hiển thị thông báo
            Row emptyRow = sheet.createRow(rowIndex++);
            Cell emptyCell = emptyRow.createCell(0);
            emptyCell.setCellValue("Không có dữ liệu câu hỏi");
            emptyCell.setCellStyle(dataStyle);
        }
    }

    /**
     * Sheet 3: DANH_GIA_SO_BO (Auto assessment)
     * Hiển thị đánh giá tổng quát dựa vào kết quả khám
     */
    private void createAssessmentSheet(
            Workbook workbook,
            PatientFormSubmission submission,
            List<FormQuestion> questions,
            Map<String, String> answerMap
    ) {
        Sheet sheet = workbook.createSheet("DANH_GIA_SO_BO");
        sheet.setColumnWidth(0, 15000);
        sheet.setColumnWidth(1, 15000);

        int rowIndex = 0;

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("ĐÁNH GIÁ SƠ BỘ");
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

        rowIndex++; // Empty row

        // Tổng điểm
        String totalScoreStr = submission.getTotalScore() != null 
                ? String.format("%.2f", submission.getTotalScore())
                : "Không có dữ liệu";
        addInfoRow(sheet, workbook, rowIndex++, "Tổng điểm:", totalScoreStr);

        // Mức nguy cơ
        String riskLevel = submission.getRiskLevel() != null ? submission.getRiskLevel() : "Không xác định";
        addInfoRow(sheet, workbook, rowIndex++, "Mức nguy cơ:", riskLevel);

        rowIndex++; // Empty row

        // Gợi ý đánh giá tự động dựa vào kết quả
        Row suggestionHeaderRow = sheet.createRow(rowIndex++);
        Cell suggestionHeaderCell = suggestionHeaderRow.createCell(0);
        suggestionHeaderCell.setCellValue("GỢI Ý ĐÁNH GIÁ:");
        CellStyle boldStyle = workbook.createCellStyle();
        Font boldFont = workbook.createFont();
        boldFont.setBold(true);
        boldStyle.setFont(boldFont);
        suggestionHeaderCell.setCellStyle(boldStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        // Auto-generate suggestions based on answers
        List<String> suggestions = generateAutoSuggestions(questions, answerMap);
        if (!suggestions.isEmpty()) {
            for (String suggestion : suggestions) {
                Row suggestionRow = sheet.createRow(rowIndex++);
                Cell suggestionCell = suggestionRow.createCell(0);
                suggestionCell.setCellValue("• " + suggestion);
                CellStyle wrapStyle = workbook.createCellStyle();
                wrapStyle.setWrapText(true);
                suggestionCell.setCellStyle(wrapStyle);
                sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));
            }
        } else {
            Row noSuggestionRow = sheet.createRow(rowIndex++);
            Cell noSuggestionCell = noSuggestionRow.createCell(0);
            noSuggestionCell.setCellValue("Chưa có đánh giá tự động. Vui lòng tham khảo ý kiến bác sĩ.");
            sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));
        }
    }

    /**
     * Tạo gợi ý tự động dựa vào giá trị trả lời
     */
    private List<String> generateAutoSuggestions(
            List<FormQuestion> questions,
            Map<String, String> answerMap
    ) {
        List<String> suggestions = new ArrayList<>();

        for (FormQuestion question : questions) {
            String code = question.getQuestionCode();
            String value = answerMap.get(code);
            
            if (value == null || value.isBlank()) continue;

            try {
                // Kiểm tra numeric questions với min/max
                if (question.getQuestionType() == FormQuestion.QuestionType.NUMBER) {
                    double numValue = Double.parseDouble(value);
                    
                    // Check BMI
                    if (code.toLowerCase().contains("bmi")) {
                        if (numValue < 18.5) {
                            suggestions.add("BMI thấp (" + numValue + ") - Nguy cơ suy dinh dưỡng");
                        } else if (numValue >= 25 && numValue < 30) {
                            suggestions.add("BMI cao (" + numValue + ") - Thừa cân, cần giảm cân");
                        } else if (numValue >= 30) {
                            suggestions.add("BMI rất cao (" + numValue + ") - Béo phì, nguy cơ tim mạch");
                        }
                    }
                    
                    // Check blood pressure
                    if (code.toLowerCase().contains("systolic") || code.toLowerCase().contains("huyetap_tam_thu")) {
                        if (numValue >= 140) {
                            suggestions.add("Huyết áp tâm thu cao (" + numValue + " mmHg) - Nguy cơ tăng huyết áp");
                        }
                    }
                    if (code.toLowerCase().contains("diastolic") || code.toLowerCase().contains("huyetap_tam_truong")) {
                        if (numValue >= 90) {
                            suggestions.add("Huyết áp tâm trương cao (" + numValue + " mmHg) - Nguy cơ tăng huyết áp");
                        }
                    }
                    
                    // Check glucose
                    if (code.toLowerCase().contains("glucose") || code.toLowerCase().contains("duonghuyet")) {
                        if (numValue >= 126) {
                            suggestions.add("Đường huyết cao (" + numValue + " mg/dL) - Nguy cơ tiểu đường");
                        } else if (numValue >= 100 && numValue < 126) {
                            suggestions.add("Đường huyết tăng nhẹ (" + numValue + " mg/dL) - Tiền tiểu đường");
                        }
                    }
                    
                    // Check HbA1c
                    if (code.toLowerCase().contains("hba1c")) {
                        if (numValue >= 6.5) {
                            suggestions.add("HbA1c cao (" + numValue + "%) - Tiểu đường không kiểm soát");
                        } else if (numValue >= 5.7 && numValue < 6.5) {
                            suggestions.add("HbA1c tăng nhẹ (" + numValue + "%) - Tiền tiểu đường");
                        }
                    }
                    
                    // Check min/max from question config
                    if (question.getMaxValue() != null && numValue > question.getMaxValue()) {
                        suggestions.add(question.getQuestionText() + " vượt ngưỡng tối đa (" + numValue + " > " + question.getMaxValue() + ")");
                    }
                    if (question.getMinValue() != null && numValue < question.getMinValue()) {
                        suggestions.add(question.getQuestionText() + " dưới ngưỡng tối thiểu (" + numValue + " < " + question.getMinValue() + ")");
                    }
                }
            } catch (NumberFormatException ignored) {
                // Not a number, skip
            }
        }

        return suggestions;
    }

    /**
     * Helper: Add info row (label + value)
     */
    private void addInfoRow(Sheet sheet, Workbook workbook, int rowIndex, String label, String value) {
        Row row = sheet.createRow(rowIndex);
        
        CellStyle labelStyle = workbook.createCellStyle();
        Font labelFont = workbook.createFont();
        labelFont.setBold(true);
        labelStyle.setFont(labelFont);
        
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
    }

    /**
     * Create header cell style
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        // Font
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        
        // Background
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Border
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        // Alignment
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }

    /**
     * Create data cell style
     */
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        // Border
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        // Alignment
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        return style;
    }

    /**
     * Create default hospital template
     */
    private HospitalTemplate createDefaultTemplate() {
        HospitalTemplate template = new HospitalTemplate();
        template.setHospitalName("BỆNH VIỆN ĐA KHOA");
        template.setDepartment("Khoa Nội tổng quát");
        template.setAddress("123 Đường ABC, Quận XYZ");
        return template;
    }
}
