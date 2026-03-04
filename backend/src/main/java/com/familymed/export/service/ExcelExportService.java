package com.familymed.export.service;

import com.familymed.export.entity.HospitalTemplate;
import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.guideline.Guideline;
import com.familymed.patient.entity.Patient;
import com.familymed.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;

/**
 * Service for generating professional hospital-grade Excel reports
 * Includes patient information, clinical inputs, calculations, and guidelines
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelExportService {
    
    private static final int HEADER_ROW_HEIGHT = 40;
    private static final int SECTION_TITLE_ROW_HEIGHT = 25;
    
    // Color codes (RGB)
    private static final byte[] HEADER_YELLOW = new byte[]{(byte) 255, (byte) 230, (byte) 109}; // Light yellow
    private static final byte[] LIGHT_GRAY = new byte[]{(byte) 240, (byte) 240, (byte) 240};    // Light gray
    private static final byte[] LIGHT_RESULT = new byte[]{(byte) 255, (byte) 253, (byte) 208}; // Light result yellow
    private static final byte[] RISK_LOW = new byte[]{(byte) 198, (byte) 239, (byte) 206};     // Light green
    private static final byte[] RISK_MEDIUM = new byte[]{(byte) 255, (byte) 242, (byte) 204}; // Light orange
    private static final byte[] RISK_HIGH = new byte[]{(byte) 255, (byte) 199, (byte) 206};   // Light red
    
    @Getter
    @Setter(AccessLevel.PRIVATE)
    private static class ExcelContext {
        private Workbook workbook;
        private Sheet sheet;
        private int currentRow;
        private CellStyle headerStyle;
        private CellStyle subHeaderStyle;
        private CellStyle tableHeaderStyle;
        private CellStyle cellBorder;
        private CellStyle resultHighlightStyle;
        private CellStyle resultLabelStyle;
    }
    
    public byte[] generatePatientReport(
            PatientFormSubmission submission,
            Patient patient,
            DiagnosticForm form,
            User doctor,
            Guideline guideline,
            HospitalTemplate template) throws IOException {
        
        ExcelContext ctx = new ExcelContext();
        ctx.setWorkbook(new XSSFWorkbook());
        ctx.setSheet(ctx.getWorkbook().createSheet("Patient Report"));
        ctx.setCurrentRow(0);
        
        initializeStyles(ctx);
        
        // Generate report sections
        drawHospitalHeader(ctx, template);
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        drawPatientInformation(ctx, patient, submission);
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        drawDoctorInformation(ctx, doctor);
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        drawClinicalInputsTable(ctx, submission);
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        drawCalculationResult(ctx, submission);
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        if (guideline != null) {
            drawGuidelineSummary(ctx, guideline);
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
        
        drawFooter(ctx, template, submission);
        
        // Auto-size columns
        autoSizeColumns(ctx.getSheet());
        
        // Convert to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ctx.getWorkbook().write(outputStream);
        ctx.getWorkbook().close();
        
        return outputStream.toByteArray();
    }
    
    private void initializeStyles(ExcelContext ctx) {
        // Hospital header style
        ctx.setHeaderStyle(createHeaderStyle(ctx.getWorkbook(), HEADER_YELLOW, true, 16));
        
        // Sub-header style
        ctx.setSubHeaderStyle(createHeaderStyle(ctx.getWorkbook(), LIGHT_GRAY, true, 12));
        
        // Table header style
        ctx.setTableHeaderStyle(createHeaderStyle(ctx.getWorkbook(), LIGHT_GRAY, false, 11));
        
        // Cell border style
        ctx.setCellBorder(createBorderStyle(ctx.getWorkbook()));
        
        // Result highlight style
        ctx.setResultHighlightStyle(createHighlightStyle(ctx.getWorkbook(), LIGHT_RESULT));
        
        // Result label style
        ctx.setResultLabelStyle(createResultLabelStyle(ctx.getWorkbook()));
    }
    
    private CellStyle createHeaderStyle(Workbook workbook, byte[] bgColor, boolean bold, int fontSize) {
        CellStyle style = workbook.createCellStyle();
        XSSFColor xssfColor = new XSSFColor(bgColor, null);
        style.setFillForegroundColor(xssfColor);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        XSSFFont font = (XSSFFont) workbook.createFont();
        font.setBold(bold);
        font.setFontHeightInPoints((short) fontSize);
        font.setColor(IndexedColors.BLACK.getIndex());
        style.setFont(font);
        
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        
        return style;
    }
    
    private CellStyle createBorderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        
        BorderStyle borderStyle = BorderStyle.THIN;
        style.setBorderTop(borderStyle);
        style.setBorderBottom(borderStyle);
        style.setBorderLeft(borderStyle);
        style.setBorderRight(borderStyle);
        
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        
        return style;
    }
    
    private CellStyle createHighlightStyle(Workbook workbook, byte[] bgColor) {
        CellStyle style = workbook.createCellStyle();
        XSSFColor xssfColor = new XSSFColor(bgColor, null);
        style.setFillForegroundColor(xssfColor);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        XSSFFont font = (XSSFFont) workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        
        BorderStyle borderStyle = BorderStyle.MEDIUM;
        style.setBorderTop(borderStyle);
        style.setBorderBottom(borderStyle);
        style.setBorderLeft(borderStyle);
        style.setBorderRight(borderStyle);
        
        return style;
    }
    
    private CellStyle createResultLabelStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        XSSFFont font = (XSSFFont) workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    private void drawHospitalHeader(ExcelContext ctx, HospitalTemplate template) {
        Sheet sheet = ctx.getSheet();
        
        // Hospital name - merged cells
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(HEADER_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue(safeText(template.getHospitalName(), "Family Medicine Clinic"));
        cell.setCellStyle(ctx.getHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Department and generated date
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue("Department: " + safeText(template.getDepartment(), "Clinical Assessment"));
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 2));
        
        cell = row.createCell(3);
        cell.setCellValue("Generated: " + new SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date()));
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 3, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Address
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue("Address: " + safeText(template.getAddress(), "N/A"));
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Report ID
        String reportId = "RPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue("Report ID: " + reportId);
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
    }
    
    private void drawPatientInformation(ExcelContext ctx, Patient patient, PatientFormSubmission submission) {
        Sheet sheet = ctx.getSheet();
        
        // Section title
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(SECTION_TITLE_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue("PATIENT INFORMATION");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Patient details grid
        String[][] patientData = {
                {"Full Name", patient.getFullName(), "Patient ID", patient.getPatientCode() != null ? patient.getPatientCode() : "N/A"},
                {"Date of Birth", patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : "N/A", 
                        "Age", calculateAge(patient.getDateOfBirth()) + " years"},
                {"Gender", patient.getGender() != null ? patient.getGender().toString() : "N/A", 
                        "Email", patient.getEmail() != null ? patient.getEmail() : "N/A"},
                {"Contact", patient.getPhoneNumber() != null ? patient.getPhoneNumber() : "N/A", 
                        "Status", patient.getStatus() != null ? patient.getStatus().toString() : "ACTIVE"}
        };
        
        for (String[] rowData : patientData) {
            row = sheet.createRow(ctx.getCurrentRow());
            for (int col = 0; col < rowData.length; col++) {
                cell = row.createCell(col);
                if (col % 2 == 0) {
                    cell.setCellValue(rowData[col]);
                    cell.setCellStyle(ctx.getResultLabelStyle());
                } else {
                    cell.setCellValue(rowData[col]);
                    cell.setCellStyle(ctx.getCellBorder());
                }
            }
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
    }
    
    private void drawDoctorInformation(ExcelContext ctx, User doctor) {
        Sheet sheet = ctx.getSheet();
        
        // Section title
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(SECTION_TITLE_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue("DOCTOR / STAFF INFORMATION");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Doctor details
        String[][] doctorData = {
                {"Doctor Name", doctor != null ? (doctor.getFullName() != null ? doctor.getFullName() : doctor.getUsername()) : "N/A"},
                {"Staff ID", doctor != null ? doctor.getUserId().toString() : "N/A"},
                {"Email", doctor != null && doctor.getEmail() != null ? doctor.getEmail() : "N/A"},
                {"Role", doctor != null && doctor.getRole() != null ? doctor.getRole().getRoleName() : "N/A"}
        };
        
        for (String[] rowData : doctorData) {
            row = sheet.createRow(ctx.getCurrentRow());
            cell = row.createCell(0);
            cell.setCellValue(rowData[0]);
            cell.setCellStyle(ctx.getResultLabelStyle());
            
            cell = row.createCell(1);
            cell.setCellValue(rowData[1]);
            cell.setCellStyle(ctx.getCellBorder());
            sheet.addMergedRegion(new CellRangeAddress(
                    ctx.getCurrentRow(), ctx.getCurrentRow(), 1, 4));
            
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
    }
    
    private void drawClinicalInputsTable(ExcelContext ctx, PatientFormSubmission submission) {
        Sheet sheet = ctx.getSheet();
        
        // Section title
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(SECTION_TITLE_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue("CLINICAL INPUTS");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Table headers
        String[] headers = {"Parameter", "Value", "Unit", "Reference Range", "Notes"};
        row = sheet.createRow(ctx.getCurrentRow());
        for (int i = 0; i < headers.length; i++) {
            cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(ctx.getTableHeaderStyle());
        }
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Parse submission data JSON
        try {
            ObjectMapper mapper = new ObjectMapper();
            if (submission.getSubmissionData() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = mapper.readValue(submission.getSubmissionData(), Map.class);
                
                int rowIndex = 0;
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    if (rowIndex >= 20) break; // Limit to 20 rows
                    
                    row = sheet.createRow(ctx.getCurrentRow());
                    cell = row.createCell(0);
                    cell.setCellValue(entry.getKey());
                    cell.setCellStyle(ctx.getCellBorder());
                    
                    cell = row.createCell(1);
                    cell.setCellValue(String.valueOf(entry.getValue()));
                    cell.setCellStyle(ctx.getCellBorder());
                    
                    // Empty unit and reference range columns
                    for (int i = 2; i < 5; i++) {
                        cell = row.createCell(i);
                        cell.setCellStyle(ctx.getCellBorder());
                    }
                    
                    ctx.setCurrentRow(ctx.getCurrentRow() + 1);
                    rowIndex++;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse submission data JSON", e);
        }
    }
    
    private void drawCalculationResult(ExcelContext ctx, PatientFormSubmission submission) {
        Sheet sheet = ctx.getSheet();
        
        // Section title
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(SECTION_TITLE_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue("CALCULATION RESULT");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Score row
        row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(30);
        cell = row.createCell(0);
        cell.setCellValue("Total Score");
        cell.setCellStyle(ctx.getResultLabelStyle());
        
        cell = row.createCell(1);
        cell.setCellValue(submission.getTotalScore() != null ? submission.getTotalScore() : 0.0);
        cell.setCellStyle(ctx.getResultHighlightStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 1, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Risk level row with color coding
        row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(30);
        cell = row.createCell(0);
        cell.setCellValue("Risk Category");
        cell.setCellStyle(ctx.getResultLabelStyle());
        
        cell = row.createCell(1);
        String riskLevel = submission.getRiskLevel() != null ? submission.getRiskLevel() : "UNKNOWN";
        cell.setCellValue(riskLevel);
        
        // Color code based on risk
        CellStyle riskStyle = createHighlightStyle(ctx.getWorkbook(), getRiskColor(riskLevel));
        cell.setCellStyle(riskStyle);
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 1, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Interpretation row
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue("Interpretation");
        cell.setCellStyle(ctx.getResultLabelStyle());
        
        cell = row.createCell(1);
        String diagnosticResult = submission.getDiagnosticResult() != null ? 
                submission.getDiagnosticResult() : "Assessment complete";
        cell.setCellValue(diagnosticResult);
        cell.setCellStyle(ctx.getCellBorder());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 1, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
    }
    
    private void drawGuidelineSummary(ExcelContext ctx, Guideline guideline) {
        Sheet sheet = ctx.getSheet();
        
        if (guideline == null) return;
        
        // Section title
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(SECTION_TITLE_ROW_HEIGHT);
        Cell cell = row.createCell(0);
        cell.setCellValue("GUIDELINE RECOMMENDATIONS");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Guideline title
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue(guideline.getTitle());
        cell.setCellStyle(ctx.getResultLabelStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Summary
        if (guideline.getSummary() != null && !guideline.getSummary().isEmpty()) {
            row = sheet.createRow(ctx.getCurrentRow());
            row.setHeightInPoints(30);
            cell = row.createCell(0);
            cell.setCellValue(guideline.getSummary());
            cell.setCellStyle(ctx.getCellBorder());
            sheet.addMergedRegion(new CellRangeAddress(
                    ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
        
        // Recommendations (if JSON array)
        if (guideline.getRecommendations() != null && !guideline.getRecommendations().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                List<String> recommendations = mapper.readValue(guideline.getRecommendations(), List.class);
                
                for (String rec : recommendations) {
                    row = sheet.createRow(ctx.getCurrentRow());
                    cell = row.createCell(0);
                    cell.setCellValue("• " + rec);
                    cell.setCellStyle(ctx.getCellBorder());
                    sheet.addMergedRegion(new CellRangeAddress(
                            ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
                    ctx.setCurrentRow(ctx.getCurrentRow() + 1);
                }
            } catch (Exception e) {
                log.warn("Failed to parse guideline recommendations", e);
            }
        }
    }
    
    private void drawFooter(ExcelContext ctx, HospitalTemplate template, PatientFormSubmission submission) {
        Sheet sheet = ctx.getSheet();
        
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Disclaimer
        Row row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(20);
        Cell cell = row.createCell(0);
        cell.setCellValue("DISCLAIMER");
        cell.setCellStyle(ctx.getSubHeaderStyle());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        row = sheet.createRow(ctx.getCurrentRow());
        row.setHeightInPoints(40);
        cell = row.createCell(0);
        cell.setCellValue(safeText(template.getDisclaimerText(), "This report is generated for clinical use only."));
        cell.setCellStyle(ctx.getCellBorder());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        // Signature and stamp placeholders
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        
        if (Boolean.TRUE.equals(template.getSignatureRequired())) {
            row = sheet.createRow(ctx.getCurrentRow());
            cell = row.createCell(0);
            cell.setCellValue("Doctor Signature: ___________________");
            cell.setCellStyle(ctx.getCellBorder());
            
            cell = row.createCell(2);
            cell.setCellValue("Date: ___________________");
            cell.setCellStyle(ctx.getCellBorder());
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
        
        if (Boolean.TRUE.equals(template.getStampRequired())) {
            row = sheet.createRow(ctx.getCurrentRow());
            cell = row.createCell(0);
            cell.setCellValue("Hospital Stamp / Seal");
            cell.setCellStyle(ctx.getResultLabelStyle());
            ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        }
        
        // Footer
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
        row = sheet.createRow(ctx.getCurrentRow());
        cell = row.createCell(0);
        cell.setCellValue(safeText(template.getFooterText(), "Confidential - For authorized personnel only."));
        cell.setCellStyle(ctx.getCellBorder());
        sheet.addMergedRegion(new CellRangeAddress(
                ctx.getCurrentRow(), ctx.getCurrentRow(), 0, 4));
        ctx.setCurrentRow(ctx.getCurrentRow() + 1);
    }
    
    private byte[] getRiskColor(String riskLevel) {
        if (riskLevel == null) return RISK_MEDIUM;
        return switch (riskLevel.toUpperCase()) {
            case "LOW" -> RISK_LOW;
            case "HIGH" -> RISK_HIGH;
            default -> RISK_MEDIUM;
        };
    }
    
    private int calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
    
    private void autoSizeColumns(Sheet sheet) {
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
            // Add some padding
            sheet.setColumnWidth(i, sheet.getColumnWidth(i) + 500);
        }
    }

    private String safeText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
