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
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

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

            // Sheet 3: Ma trận phả hệ (nếu có MATRIX_FAMILY_DISEASE questions)
            if (hasMatrixQuestions(questions)) {
                createMatrixFamilyDiseaseSheet(workbook, questions, answerMap, template);
            }

            // Sheet 4: Đánh giá sơ bộ
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
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 18000);

        int rowIndex = 0;

        // Hospital header
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        String hospitalName = template != null && template.getHospitalName() != null 
                ? template.getHospitalName() : "BỆNH VIỆN ĐA KHOA";
        hospitalCell.setCellValue(hospitalName);
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THÔNG TIN BỆNH NHÂN - " + (form.getFormName() != null ? form.getFormName() : "BIỂU MẪU"));
        CellStyle titleStyle = createTitleStyleEnhanced(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space
        rowIndex++; // Space

        // Patient information
        addSectionHeader(sheet, workbook, rowIndex++, "THÔNG TIN BỆNH NHÂN");
        
        String patientName = submission.getPatientName() != null ? submission.getPatientName() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Họ tên:", patientName);
        
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
        
        String gender = "-";
        if (submission.getPatient() != null && submission.getPatient().getGender() != null) {
            try {
                gender = submission.getPatient().getGender().toString();
            } catch (Exception e) {
                gender = "-";
            }
        }
        addInfoRow(sheet, workbook, rowIndex++, "Giới tính:", gender);
        
        String phone = submission.getPhone() != null ? submission.getPhone() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Số điện thoại:", phone);
        
        String email = submission.getEmail() != null ? submission.getEmail() : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Email:", email);
        
        rowIndex++; // Space

        // Form information
        addSectionHeader(sheet, workbook, rowIndex++, "THÔNG TIN BIỂU MẪU");
        
        addInfoRow(sheet, workbook, rowIndex++, "Loại biểu mẫu:", form.getFormName() != null ? form.getFormName() : "-");
        
        String submissionDate = submission.getCreatedAt() != null 
                ? submission.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))
                : "-";
        addInfoRow(sheet, workbook, rowIndex++, "Ngày nhập liệu:", submissionDate);
        
        addInfoRow(sheet, workbook, rowIndex++, "Mã submission:", submission.getSubmissionId().toString());
        
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
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 4));

        rowIndex++; // Space

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("KẾT QUẢ KHÁM - CHI TIẾT CÁC HẠNG MỤC");
        CellStyle titleStyle = createTitleStyleEnhanced(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 4));

        rowIndex++; // Space

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
        // Skip MATRIX_FAMILY_DISEASE questions - they have their own sheet
        CellStyle dataStyle = createDataStyle(workbook);
        int stt = 1;
        
        if (questions != null && !questions.isEmpty()) {
            for (FormQuestion question : questions) {
                // Skip matrix questions - they are displayed in MA_TRAN_PHA_HE sheet
                if (question.getQuestionType() == FormQuestion.QuestionType.MATRIX_FAMILY_DISEASE) {
                    continue;
                }
                
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
                    String rawValue = answerMap.get(question.getQuestionCode());
                    value = formatAnswerValue(question, rawValue);
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
        titleCell.setCellValue("ĐÁNH GIÁ SƠ BỘ - KẾT QUẢ PHÂN TÍCH");
        CellStyle titleStyle = createTitleStyleEnhanced(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 1));

        rowIndex++; // Space
        rowIndex++; // Space

        // Summary section
        addSectionHeader(sheet, workbook, rowIndex++, "KẾT QUẢ ĐÁNH GIÁ");

        String totalScoreStr = submission.getTotalScore() != null 
                ? String.format("%.2f", submission.getTotalScore())
                : "Không có dữ liệu";
        addInfoRow(sheet, workbook, rowIndex++, "Tổng điểm:", totalScoreStr);

        String riskLevel = submission.getRiskLevel() != null ? submission.getRiskLevel() : "Không xác định";
        addInfoRow(sheet, workbook, rowIndex++, "Mức nguy cơ:", riskLevel);

        rowIndex++; // Space

        // Suggestions section
        addSectionHeader(sheet, workbook, rowIndex++, "GỢI Ý ĐÁNH GIÁ TỰ ĐỘNG");

        // Auto-generate suggestions based on answers
        List<String> suggestions = generateAutoSuggestions(questions, answerMap);
        if (!suggestions.isEmpty()) {
            for (String suggestion : suggestions) {
                Row suggestionRow = sheet.createRow(rowIndex++);
                Cell suggestionCell = suggestionRow.createCell(1);
                suggestionCell.setCellValue("• " + suggestion);
                CellStyle wrapStyle = workbook.createCellStyle();
                wrapStyle.setWrapText(true);
                wrapStyle.setVerticalAlignment(VerticalAlignment.TOP);
                suggestionCell.setCellStyle(wrapStyle);
            }
        } else {
            Row noSuggestionRow = sheet.createRow(rowIndex++);
            Cell noSuggestionCell = noSuggestionRow.createCell(1);
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
     * Helper: Add info row (label + value) with styling
     */
    private void addInfoRow(Sheet sheet, Workbook workbook, int rowIndex, String label, String value) {
        Row row = sheet.createRow(rowIndex);
        
        CellStyle labelStyle = createLabelStyleEnhanced(workbook);
        CellStyle dataStyle = createDataStyleEnhanced(workbook);
        
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(dataStyle);
    }

    /**
     * Add section header row
     */
    private void addSectionHeader(Sheet sheet, Workbook workbook, int rowIndex, String sectionName) {
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
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Font color
        font.setColor(IndexedColors.WHITE.getIndex());
        
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
     * Create data cell style with borders
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
        style.setWrapText(true);
        
        return style;
    }

    /**
     * Enhanced label style with yellow background
     */
    private CellStyle createLabelStyleEnhanced(Workbook workbook) {
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

    /**
     * Enhanced data style with borders and wrap
     */
    private CellStyle createDataStyleEnhanced(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    /**
     * Create hospital header style
     */
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

    /**
     * Create title style with grey background
     */
    private CellStyle createTitleStyleEnhanced(Workbook workbook) {
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

    /**
     * Check if form has any MATRIX_FAMILY_DISEASE questions
     */
    private boolean hasMatrixQuestions(List<FormQuestion> questions) {
        return questions != null && questions.stream()
                .anyMatch(q -> q.getQuestionType() == FormQuestion.QuestionType.MATRIX_FAMILY_DISEASE);
    }

    /**
     * Format answer value based on question type
     * Converts complex JSON structures to human-readable format
     */
    private String formatAnswerValue(FormQuestion question, String rawValue) {
        if (rawValue == null || rawValue.isBlank() || rawValue.equals("null")) {
            return "-";
        }

        // For SINGLE_CHOICE_WITH_SUBFIELDS and MULTIPLE_CHOICE_WITH_SUBFIELDS
        if (question.getQuestionType() == FormQuestion.QuestionType.SINGLE_CHOICE_WITH_SUBFIELDS ||
            question.getQuestionType() == FormQuestion.QuestionType.MULTIPLE_CHOICE_WITH_SUBFIELDS) {
            
            try {
                // Parse the answer JSON
                com.fasterxml.jackson.databind.JsonNode answerNode = objectMapper.readTree(rawValue);
                
                // Get selected options
                com.fasterxml.jackson.databind.JsonNode selectedOptionsNode = answerNode.get("selectedOptions");
                if (selectedOptionsNode == null || !selectedOptionsNode.isArray() || selectedOptionsNode.isEmpty()) {
                    return "-";
                }
                
                List<String> formattedParts = new ArrayList<>();
                
                // Build a map of option values to labels
                Map<String, String> optionLabels = new HashMap<>();
                if (question.getOptionItems() != null) {
                    for (FormQuestionOption option : question.getOptionItems()) {
                        String key = option.getOptionValue() != null ? option.getOptionValue() : option.getOptionText();
                        optionLabels.put(key, option.getOptionText());
                    }
                }
                
                // Get subFieldsData
                com.fasterxml.jackson.databind.JsonNode subFieldsDataNode = answerNode.get("subFieldsData");
                
                // Process each selected option
                for (com.fasterxml.jackson.databind.JsonNode optionNode : selectedOptionsNode) {
                    String optionKey = optionNode.asText();
                    String optionLabel = optionLabels.getOrDefault(optionKey, optionKey);
                    
                    StringBuilder optionText = new StringBuilder(optionLabel);
                    
                    // If this option has sub-field data, append it
                    if (subFieldsDataNode != null && subFieldsDataNode.has(optionKey)) {
                        com.fasterxml.jackson.databind.JsonNode optionSubData = subFieldsDataNode.get(optionKey);
                        
                        List<String> subFieldValues = new ArrayList<>();
                        optionSubData.fields().forEachRemaining(entry -> {
                            String fieldKey = entry.getKey();
                            String fieldValue = entry.getValue().asText();
                            if (fieldValue != null && !fieldValue.isBlank()) {
                                subFieldValues.add(fieldKey + ": " + fieldValue);
                            }
                        });
                        
                        if (!subFieldValues.isEmpty()) {
                            optionText.append(" (").append(String.join(", ", subFieldValues)).append(")");
                        }
                    }
                    
                    formattedParts.add(optionText.toString());
                }
                
                return String.join("; ", formattedParts);
                
            } catch (Exception e) {
                // If parsing fails, return raw value
                return rawValue;
            }
        }
        
        // For SINGLE_CHOICE, try to get label from options
        if (question.getQuestionType() == FormQuestion.QuestionType.SINGLE_CHOICE) {
            if (question.getOptionItems() != null) {
                for (FormQuestionOption option : question.getOptionItems()) {
                    String optionValue = option.getOptionValue() != null ? option.getOptionValue() : option.getOptionText();
                    if (optionValue.equals(rawValue)) {
                        return option.getOptionText();
                    }
                }
            }
        }
        
        // For MULTIPLE_CHOICE, try to parse as array and get labels
        if (question.getQuestionType() == FormQuestion.QuestionType.MULTIPLE_CHOICE) {
            try {
                com.fasterxml.jackson.databind.JsonNode arrayNode = objectMapper.readTree(rawValue);
                if (arrayNode.isArray()) {
                    Map<String, String> optionLabels = new HashMap<>();
                    if (question.getOptionItems() != null) {
                        for (FormQuestionOption option : question.getOptionItems()) {
                            String key = option.getOptionValue() != null ? option.getOptionValue() : option.getOptionText();
                            optionLabels.put(key, option.getOptionText());
                        }
                    }
                    
                    List<String> labels = new ArrayList<>();
                    for (com.fasterxml.jackson.databind.JsonNode node : arrayNode) {
                        String value = node.asText();
                        labels.add(optionLabels.getOrDefault(value, value));
                    }
                    return String.join(", ", labels);
                }
            } catch (Exception e) {
                // Fall through to return raw value
            }
        }
        
        // For BOOLEAN type
        if (question.getQuestionType() == FormQuestion.QuestionType.BOOLEAN) {
            if ("true".equalsIgnoreCase(rawValue)) return "Có";
            if ("false".equalsIgnoreCase(rawValue)) return "Không";
        }
        
        // Default: return as-is
        return rawValue;
    }

    /**
     * Create sheet for MATRIX_FAMILY_DISEASE questions
     * Displays family disease history as a proper table
     */
    private void createMatrixFamilyDiseaseSheet(
            Workbook workbook,
            List<FormQuestion> questions,
            Map<String, String> answerMap,
            HospitalTemplate template
    ) {
        // Filter for matrix questions only
        List<FormQuestion> matrixQuestions = questions.stream()
                .filter(q -> q.getQuestionType() == FormQuestion.QuestionType.MATRIX_FAMILY_DISEASE)
                .collect(Collectors.toList());

        if (matrixQuestions.isEmpty()) return;

        Sheet sheet = workbook.createSheet("MA_TRAN_PHA_HE");

        // Set wide columns for disease and family member names
        sheet.setColumnWidth(0, 3000);  // STT
        sheet.setColumnWidth(1, 6000);  // Bệnh
        sheet.setColumnWidth(2, 5000);  // Thành viên
        sheet.setColumnWidth(3, 4000);  // Có bệnh
        sheet.setColumnWidth(4, 5000);  // Năm mắc
        sheet.setColumnWidth(5, 4000);  // Đã mất

        int rowIndex = 0;

        // Hospital header
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        String hospitalName = template != null && template.getHospitalName() != null 
                ? template.getHospitalName() : "BỆNH VIỆN ĐA KHOA";
        hospitalCell.setCellValue(hospitalName);
        CellStyle hospitalStyle = createHospitalHeaderStyle(workbook);
        hospitalCell.setCellStyle(hospitalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 5));

        rowIndex++;

        // Title
        Row titleRow = sheet.createRow(rowIndex++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("MA TRẬN PHÁ HỆ BỆNH - LỊCH SỬ GIA ĐÌNH");
        CellStyle titleStyle = createTitleStyleEnhanced(workbook);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIndex - 1, rowIndex - 1, 0, 5));

        rowIndex++; // Space
        rowIndex++; // Space

        // Process each matrix question
        int questionIdx = 1;
        for (FormQuestion question : matrixQuestions) {
            String questionCode = question.getQuestionCode();
            String answerValue = answerMap.getOrDefault(questionCode, "{}");

            try {
                // Parse matrix data from JSON
                MatrixData matrixData = objectMapper.readValue(answerValue, MatrixData.class);

                // Section header
                addSectionHeader(sheet, workbook, rowIndex++, 
                        "Câu " + questionIdx + ": " + (question.getQuestionText() != null ? question.getQuestionText() : ""));
                rowIndex++; // Space

                // Table header
                Row headerRow = sheet.createRow(rowIndex++);
                CellStyle headerStyle = createHeaderStyle(workbook);

                String[] headers = {"STT", "Bệnh", "Thành viên", "Có bệnh", "Năm mắc", "Đã mất"};
                for (int i = 0; i < headers.length; i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                // Data rows
                if (matrixData != null && matrixData.getMatrix() != null && !matrixData.getMatrix().isEmpty()) {
                    CellStyle dataStyle = createDataStyle(workbook);
                    int stt = 1;

                    for (MatrixEntry entry : matrixData.getMatrix()) {
                        Row dataRow = sheet.createRow(rowIndex++);

                        // STT
                        Cell sttCell = dataRow.createCell(0);
                        sttCell.setCellValue(stt++);
                        sttCell.setCellStyle(dataStyle);

                        // Disease
                        String diseaseLabel = "-";
                        if (matrixData.getRows() != null) {
                            MatrixItem disease = matrixData.getRows().stream()
                                    .filter(r -> r.getKey().equals(entry.getRow()))
                                    .findFirst()
                                    .orElse(null);
                            if (disease != null) diseaseLabel = disease.getLabel();
                        }
                        Cell diseaseCell = dataRow.createCell(1);
                        diseaseCell.setCellValue(diseaseLabel);
                        diseaseCell.setCellStyle(dataStyle);

                        // Family member
                        String memberLabel = "-";
                        String memberInfo = "";
                        if (matrixData.getColumns() != null) {
                            MatrixColumn column = matrixData.getColumns().stream()
                                    .filter(c -> c.getKey().equals(entry.getColumn()))
                                    .findFirst()
                                    .orElse(null);
                            if (column != null) {
                                memberLabel = column.getLabel();
                                if (column.getRelationship() != null) {
                                    memberInfo = " (" + column.getRelationship() + ")";
                                }
                                if (column.getBirth_year() != null) {
                                    memberInfo += ", SN: " + column.getBirth_year();
                                }
                            }
                        }
                        Cell memberCell = dataRow.createCell(2);
                        memberCell.setCellValue(memberLabel + memberInfo);
                        memberCell.setCellStyle(dataStyle);

                        // Has disease
                        Cell hasCell = dataRow.createCell(3);
                        hasCell.setCellValue(entry.isHas_disease() ? "Có" : "Không");
                        hasCell.setCellStyle(dataStyle);

                        // Year
                        Cell yearCell = dataRow.createCell(4);
                        yearCell.setCellValue(entry.getYear() != null ? String.valueOf(entry.getYear()) : "-");
                        yearCell.setCellStyle(dataStyle);

                        // Deceased status
                        Cell deceasedCell = dataRow.createCell(5);
                        deceasedCell.setCellValue(entry.getIs_deceased() != null && entry.getIs_deceased() ? "Có" : "Không");
                        deceasedCell.setCellStyle(dataStyle);
                    }
                } else {
                    // No data
                    Row emptyRow = sheet.createRow(rowIndex++);
                    Cell emptyCell = emptyRow.createCell(1);
                    emptyCell.setCellValue("Chưa có dữ liệu");
                    CellStyle dataStyle = createDataStyle(workbook);
                    emptyCell.setCellStyle(dataStyle);
                }

                rowIndex += 2; // Space between questions
                questionIdx++;

            } catch (Exception e) {
                // If parsing fails, show error
                Row errorRow = sheet.createRow(rowIndex++);
                Cell errorCell = errorRow.createCell(1);
                errorCell.setCellValue("Lỗi đọc dữ liệu: " + e.getMessage());
            }
        }
    }

    /**
     * Helper classes for matrix data JSON parsing
     */
    public static class MatrixData {
        private List<MatrixItem> rows;
        private List<MatrixColumn> columns;
        private List<MatrixEntry> matrix;

        public List<MatrixItem> getRows() { return rows; }
        public void setRows(List<MatrixItem> rows) { this.rows = rows; }

        public List<MatrixColumn> getColumns() { return columns; }
        public void setColumns(List<MatrixColumn> columns) { this.columns = columns; }

        public List<MatrixEntry> getMatrix() { return matrix; }
        public void setMatrix(List<MatrixEntry> matrix) { this.matrix = matrix; }
    }

    public static class MatrixItem {
        private String key;
        private String label;

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }

    public static class MatrixColumn extends MatrixItem {
        private Integer birth_year;
        private String relationship;

        public Integer getBirth_year() { return birth_year; }
        public void setBirth_year(Integer birth_year) { this.birth_year = birth_year; }

        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }

    public static class MatrixEntry {
        private String row;
        private String column;
        private boolean has_disease;
        private Integer year;
        private Boolean is_deceased;

        public String getRow() { return row; }
        public void setRow(String row) { this.row = row; }

        public String getColumn() { return column; }
        public void setColumn(String column) { this.column = column; }

        public boolean isHas_disease() { return has_disease; }
        public void setHas_disease(boolean has_disease) { this.has_disease = has_disease; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public Boolean getIs_deceased() { return is_deceased; }
        public void setIs_deceased(Boolean is_deceased) { this.is_deceased = is_deceased; }
    }
}
