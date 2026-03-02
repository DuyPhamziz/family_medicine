package com.familymed.export.service;

import com.familymed.export.entity.HospitalTemplate;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.patient.entity.Patient;
import com.familymed.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalReportExcelService {

    private final ClinicalRiskEngine riskEngine;

    public byte[] generateClinicalReport(
            PatientFormSubmission submission,
            Patient patient,
            User doctor,
            HospitalTemplate template,
            List<SubmissionAnswer> answers,
            List<FormQuestion> questions
    ) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("CLINICAL_REPORT");
            sheet.setDisplayGridlines(true);

            Styles styles = new Styles(workbook);
            int rowIndex = 0;

            Map<String, FormQuestion> questionByCode = questions.stream()
                    .filter(q -> q.getQuestionCode() != null)
                    .collect(Collectors.toMap(FormQuestion::getQuestionCode, q -> q, (a, b) -> a));

            LinkedHashMap<String, RawMetricRow> rawRows = buildRawRows(answers, questionByCode);

            ClinicalRiskEngine.RiskAssessment assessment = riskEngine.evaluate(
                    submission.getRiskLevel(),
                    submission.getTotalScore(),
                    rawRows.values().stream().collect(Collectors.toMap(r -> r.label, r -> r.value, (a, b) -> a))
            );

            // SECTION A - HEADER
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION A — HEADER", styles.sectionTitle);
            rowIndex = renderHeader(sheet, rowIndex, submission, doctor, template, styles, workbook);
            rowIndex++;

            // SECTION B - PATIENT INFORMATION
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION B — PATIENT INFORMATION", styles.sectionTitle);
            rowIndex = renderPatientInfo(sheet, rowIndex, patient, submission, styles);
            rowIndex++;

            // SECTION C - RAW CLINICAL DATA
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION C — RAW CLINICAL DATA (ĐẦU RA THÔ)", styles.sectionTitle);
            rowIndex = renderRawTable(sheet, rowIndex, rawRows.values(), styles);
            rowIndex++;

            // SECTION D - OFFICIAL CLINICAL OUTPUT
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION D — OFFICIAL CLINICAL OUTPUT", styles.sectionTitle);
            rowIndex = renderOfficialOutput(sheet, rowIndex, assessment, styles);
            rowIndex++;

            // SECTION E - CARE PLAN
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION E — CARE PLAN", styles.sectionTitle);
            rowIndex = renderCarePlan(sheet, rowIndex, assessment, styles);
            rowIndex++;

            // SECTION F - DISCLAIMER
            rowIndex = sectionTitle(sheet, rowIndex, "SECTION F — DISCLAIMER", styles.sectionTitle);
            Row disclaimerRow = sheet.createRow(rowIndex++);
            Cell disclaimerCell = disclaimerRow.createCell(0);
            disclaimerCell.setCellValue("This report is clinical decision support only.");
            disclaimerCell.setCellStyle(styles.normalBorder);
            merge(sheet, disclaimerRow.getRowNum(), disclaimerRow.getRowNum(), 0, 3);

            autoSize(sheet, 4);
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to generate clinical report: " + ex.getMessage(), ex);
        }
    }

    private int renderHeader(
            Sheet sheet,
            int rowIndex,
            PatientFormSubmission submission,
            User doctor,
            HospitalTemplate template,
            Styles styles,
            Workbook workbook
    ) {
        Row hospitalRow = sheet.createRow(rowIndex++);
        Cell hospitalCell = hospitalRow.createCell(0);
        hospitalCell.setCellValue(textOrDefault(template.getHospitalName(), "Family Medicine Clinic"));
        hospitalCell.setCellStyle(styles.hospitalName);
        merge(sheet, hospitalRow.getRowNum(), hospitalRow.getRowNum(), 0, 3);

        // Logo placeholder / embedded logo if available
        Row logoRow = sheet.createRow(rowIndex++);
        Cell logoCell = logoRow.createCell(0);
        logoCell.setCellValue(template.getLogoBase64() == null || template.getLogoBase64().isBlank() ? "[Hospital Logo]" : "[Hospital Logo Embedded]");
        logoCell.setCellStyle(styles.normalBorder);

        Cell reportIdCell = logoRow.createCell(2);
        reportIdCell.setCellValue("Report ID: " + UUID.randomUUID());
        reportIdCell.setCellStyle(styles.normalBorder);
        merge(sheet, logoRow.getRowNum(), logoRow.getRowNum(), 2, 3);

        Row generatedRow = sheet.createRow(rowIndex++);
        Cell generatedCell = generatedRow.createCell(0);
        generatedCell.setCellValue("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        generatedCell.setCellStyle(styles.normalBorder);
        merge(sheet, generatedRow.getRowNum(), generatedRow.getRowNum(), 0, 1);

        Cell doctorCell = generatedRow.createCell(2);
        String doctorName = doctor != null
                ? textOrDefault(doctor.getFullName(), doctor.getUsername())
                : "Anonymous User";
        doctorCell.setCellValue("Doctor: " + doctorName);
        doctorCell.setCellStyle(styles.normalBorder);
        merge(sheet, generatedRow.getRowNum(), generatedRow.getRowNum(), 2, 3);

        return rowIndex;
    }

    private int renderPatientInfo(Sheet sheet, int rowIndex, Patient patient, PatientFormSubmission submission, Styles styles) {
        List<String[]> rows = List.of(
                new String[]{"Họ và tên", patient != null ? textOrDefault(patient.getFullName(), submission.getPatientName()) : textOrDefault(submission.getPatientName(), "N/A")},
                new String[]{"Tuổi", String.valueOf(computeAge(patient != null ? patient.getDateOfBirth() : null))},
                new String[]{"Ngày sinh", patient != null && patient.getDateOfBirth() != null ? patient.getDateOfBirth().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A"},
                new String[]{"Giới tính", patient != null && patient.getGender() != null ? patient.getGender().name() : "N/A"},
                new String[]{"Địa chỉ", patient != null ? textOrDefault(patient.getAddress(), "N/A") : "N/A"},
                new String[]{"Số điện thoại", patient != null ? textOrDefault(patient.getPhoneNumber(), submission.getPhone()) : textOrDefault(submission.getPhone(), "N/A")}
        );

        for (String[] r : rows) {
            Row row = sheet.createRow(rowIndex++);
            Cell key = row.createCell(0);
            key.setCellValue(r[0]);
            key.setCellStyle(styles.headerGray);

            Cell value = row.createCell(1);
            value.setCellValue(textOrDefault(r[1], "N/A"));
            value.setCellStyle(styles.normalBorder);
            merge(sheet, row.getRowNum(), row.getRowNum(), 1, 3);
        }
        return rowIndex;
    }

    private int renderRawTable(Sheet sheet, int rowIndex, Collection<RawMetricRow> rows, Styles styles) {
        Row header = sheet.createRow(rowIndex++);
        createCell(header, 0, "Thông số", styles.headerGray);
        createCell(header, 1, "Giá trị", styles.headerGray);
        createCell(header, 2, "Ghi chú", styles.headerGray);
        createCell(header, 3, "", styles.headerGray);
        merge(sheet, header.getRowNum(), header.getRowNum(), 2, 3);

        if (rows.isEmpty()) {
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, "N/A", styles.normalBorder);
            createCell(row, 1, "N/A", styles.normalBorder);
            createCell(row, 2, "No raw clinical data", styles.normalBorder);
            merge(sheet, row.getRowNum(), row.getRowNum(), 2, 3);
            return rowIndex;
        }

        for (RawMetricRow metric : rows) {
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, metric.label, styles.normalBorder);
            createCell(row, 1, metric.value, styles.normalBorder);
            createCell(row, 2, metric.note, styles.normalBorder);
            createCell(row, 3, "", styles.normalBorder);
        }

        return rowIndex;
    }

    private int renderOfficialOutput(Sheet sheet, int rowIndex, ClinicalRiskEngine.RiskAssessment assessment, Styles styles) {
        Row riskRow = sheet.createRow(rowIndex++);
        createCell(riskRow, 0, "Risk Level", styles.headerGray);
        Cell riskValue = riskRow.createCell(1);
        riskValue.setCellValue(assessment.levelLabel());
        riskValue.setCellStyle(assessment.level() == 4 ? styles.level4 : assessment.level() == 3 ? styles.level3 : styles.normalBorder);
        merge(sheet, riskRow.getRowNum(), riskRow.getRowNum(), 1, 3);

        if (!assessment.redFlags().isEmpty()) {
            Row redTitle = sheet.createRow(rowIndex++);
            createCell(redTitle, 0, "RED FLAG", styles.redFlagTitle);
            merge(sheet, redTitle.getRowNum(), redTitle.getRowNum(), 0, 3);

            for (String flag : assessment.redFlags()) {
                Row row = sheet.createRow(rowIndex++);
                createCell(row, 0, "• " + flag, styles.redFlagCell);
                merge(sheet, row.getRowNum(), row.getRowNum(), 0, 3);
            }
        }

        if (assessment.level() == 4) {
            Row highRow = sheet.createRow(rowIndex++);
            createCell(highRow, 0, "⚠ Level 4 alert: immediate clinical intervention required.", styles.redFlagCell);
            merge(sheet, highRow.getRowNum(), highRow.getRowNum(), 0, 3);
        }

        return rowIndex;
    }

    private int renderCarePlan(Sheet sheet, int rowIndex, ClinicalRiskEngine.RiskAssessment assessment, Styles styles) {
        for (String rec : assessment.carePlan()) {
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, "• " + rec, styles.normalBorder);
            merge(sheet, row.getRowNum(), row.getRowNum(), 0, 3);
        }

        Row follow = sheet.createRow(rowIndex++);
        createCell(follow, 0, "Follow-up timeline: " + assessment.followUpTimeline(), styles.normalBorder);
        merge(sheet, follow.getRowNum(), follow.getRowNum(), 0, 3);

        Row referral = sheet.createRow(rowIndex++);
        createCell(referral, 0, "Referral suggestion: " + assessment.referralSuggestion(), styles.normalBorder);
        merge(sheet, referral.getRowNum(), referral.getRowNum(), 0, 3);

        return rowIndex;
    }

    private LinkedHashMap<String, RawMetricRow> buildRawRows(List<SubmissionAnswer> answers, Map<String, FormQuestion> questionByCode) {
        LinkedHashMap<String, RawMetricRow> rows = new LinkedHashMap<>();

        for (SubmissionAnswer ans : answers) {
            String questionCode = ans.getQuestionCode();
            FormQuestion question = questionCode == null ? null : questionByCode.get(questionCode);
            String label = question != null && question.getQuestionText() != null && !question.getQuestionText().isBlank()
                    ? question.getQuestionText()
                    : prettifyCode(questionCode);

            String value = textOrDefault(ans.getValue(), "N/A");
            String note = question != null && question.getUnit() != null && !question.getUnit().isBlank()
                    ? "Unit: " + question.getUnit()
                    : "";

            rows.put(label, new RawMetricRow(label, value, note));
        }

        // Derived parameters for Layer 1
        addDerivedMetric(rows, "BMI");
        addDerivedMetric(rows, "Blood pressure");
        addDerivedMetric(rows, "Heart rate");

        return rows;
    }

    private void addDerivedMetric(LinkedHashMap<String, RawMetricRow> rows, String metricName) {
        boolean exists = rows.keySet().stream().anyMatch(k -> k.toLowerCase(Locale.ROOT).contains(metricName.toLowerCase(Locale.ROOT)));
        if (!exists) {
            rows.put(metricName, new RawMetricRow(metricName, "N/A", "Derived metric unavailable in submission"));
        }
    }

    private String prettifyCode(String code) {
        if (code == null || code.isBlank()) return "Clinical parameter";
        return "Clinical parameter";
    }

    private int sectionTitle(Sheet sheet, int rowIndex, String title, CellStyle style) {
        Row row = sheet.createRow(rowIndex++);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(style);
        merge(sheet, row.getRowNum(), row.getRowNum(), 0, 3);
        return rowIndex;
    }

    private int computeAge(LocalDate dob) {
        if (dob == null) return 0;
        return Period.between(dob, LocalDate.now()).getYears();
    }

    private void autoSize(Sheet sheet, int columns) {
        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
            int width = Math.min(sheet.getColumnWidth(i) + 1200, 20000);
            sheet.setColumnWidth(i, width);
        }
    }

    private void merge(Sheet sheet, int firstRow, int lastRow, int firstCol, int lastCol) {
        sheet.addMergedRegion(new CellRangeAddress(firstRow, lastRow, firstCol, lastCol));
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value == null ? "" : value);
        cell.setCellStyle(style);
    }

    private String textOrDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private record RawMetricRow(String label, String value, String note) {
    }

    private static class Styles {
        final CellStyle hospitalName;
        final CellStyle sectionTitle;
        final CellStyle headerGray;
        final CellStyle normalBorder;
        final CellStyle level3;
        final CellStyle level4;
        final CellStyle redFlagTitle;
        final CellStyle redFlagCell;

        Styles(Workbook workbook) {
            this.hospitalName = style(workbook, true, (short) 16, rgb(255, 255, 255), BorderStyle.NONE);
            this.sectionTitle = style(workbook, true, (short) 12, rgb(230, 230, 230), BorderStyle.THIN);
            this.headerGray = style(workbook, true, (short) 11, rgb(242, 242, 242), BorderStyle.THIN);
            this.normalBorder = style(workbook, false, (short) 11, rgb(255, 255, 255), BorderStyle.THIN);
            this.level3 = style(workbook, true, (short) 11, rgb(255, 242, 204), BorderStyle.THIN);
            this.level4 = style(workbook, true, (short) 11, rgb(255, 199, 206), BorderStyle.THIN);
            this.redFlagTitle = style(workbook, true, (short) 11, rgb(255, 0, 0), BorderStyle.THIN);
            this.redFlagCell = style(workbook, false, (short) 11, rgb(255, 220, 220), BorderStyle.THIN);

            Font whiteFont = workbook.createFont();
            whiteFont.setBold(true);
            whiteFont.setColor(IndexedColors.WHITE.getIndex());
            redFlagTitle.setFont(whiteFont);
        }

        private CellStyle style(Workbook workbook, boolean bold, short fontSize, byte[] bgRgb, BorderStyle borderStyle) {
            CellStyle cellStyle = workbook.createCellStyle();
            XSSFFont font = (XSSFFont) workbook.createFont();
            font.setBold(bold);
            font.setFontHeightInPoints(fontSize);
            cellStyle.setFont(font);

            cellStyle.setFillForegroundColor(new XSSFColor(bgRgb, null));
            cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            cellStyle.setAlignment(HorizontalAlignment.LEFT);
            cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            cellStyle.setWrapText(true);

            cellStyle.setBorderTop(borderStyle);
            cellStyle.setBorderBottom(borderStyle);
            cellStyle.setBorderLeft(borderStyle);
            cellStyle.setBorderRight(borderStyle);
            return cellStyle;
        }

        private byte[] rgb(int r, int g, int b) {
            return new byte[]{(byte) r, (byte) g, (byte) b};
        }
    }
}
