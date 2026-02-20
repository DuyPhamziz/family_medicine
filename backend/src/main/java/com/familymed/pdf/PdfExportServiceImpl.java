package com.familymed.pdf;

import com.familymed.careplan.entity.CarePlan;
import com.familymed.careplan.entity.CarePlanAction;
import com.familymed.careplan.repository.CarePlanActionRepository;
import com.familymed.careplan.entity.CarePlanGoal;
import com.familymed.careplan.repository.CarePlanGoalRepository;
import com.familymed.careplan.repository.CarePlanRepository;
import com.familymed.diagnosis.entity.PatientDiagnosis;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.form.service.RiskCalculationService;
import com.familymed.patient.entity.Patient;
import com.familymed.prescription.entity.Prescription;
import com.familymed.prescription.entity.PrescriptionItem;
import com.familymed.prescription.repository.PrescriptionItemRepository;
import com.familymed.prescription.repository.PrescriptionRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PdfExportServiceImpl implements PdfExportService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final RiskCalculationService riskCalculationService;
    private final CarePlanRepository carePlanRepository;
    private final CarePlanGoalRepository carePlanGoalRepository;
    private final CarePlanActionRepository carePlanActionRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAssessmentResult(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Assessment session not found"));

        Patient patient = session.getPatient();
        User doctor = session.getDoctor();

        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdOrderByAnsweredAtDesc(sessionId);
        Map<UUID, AssessmentAnswer> latestByQuestion = new LinkedHashMap<>();
        for (AssessmentAnswer answer : answers) {
            latestByQuestion.putIfAbsent(answer.getQuestionId(), answer);
        }

        Map<String, Object> answerMap = new LinkedHashMap<>();
        for (AssessmentAnswer answer : latestByQuestion.values()) {
            if (answer.getQuestionCode() == null) {
                continue;
            }
            answerMap.put(answer.getQuestionCode(), answer.getAnswerValue());
        }

        Map<String, Object> risk = riskCalculationService.calculateRisk(
                session.getForm().getFormName(),
                answerMap);

        Document document = createDocument();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addTitle(document, "Assessment Result");
            addMetaLine(document, "Assessment ID", session.getSessionId().toString());
            addMetaLine(document, "Form", session.getForm().getFormName());
            addMetaLine(document, "Status", session.getStatus().name());
            addMetaLine(document, "Started At", formatDateTime(session.getStartedAt()));
            addMetaLine(document, "Completed At", formatDateTime(session.getCompletedAt()));

            addSectionHeader(document, "Patient Information");
            addPatientInfo(document, patient);

            addSectionHeader(document, "Doctor Information");
            addDoctorInfo(document, doctor);

            addSectionHeader(document, "Risk Evaluation");
            addRiskInfo(document, risk);

            addSectionHeader(document, "Responses");
            addAnswerTable(document, latestByQuestion.values().stream().toList());

            addSignatureBlock(document);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate PDF", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCarePlan(UUID carePlanId) {
        CarePlan carePlan = carePlanRepository.findById(carePlanId)
                .orElseThrow(() -> new RuntimeException("Care plan not found"));

        Patient patient = carePlan.getPatient();
        User doctor = findUser(carePlan.getCreatedBy());

        List<CarePlanGoal> goals = carePlanGoalRepository.findByCarePlanId(carePlanId);
        List<CarePlanAction> actions = carePlanActionRepository.findByCarePlanId(carePlanId);

        Document document = createDocument();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addTitle(document, "Care Plan");
            addMetaLine(document, "Care Plan ID", carePlan.getId().toString());
            addMetaLine(document, "Status", carePlan.getStatus().name());
            addMetaLine(document, "Start Date", formatDateTime(toDateTime(carePlan.getStartDate())));
            addMetaLine(document, "End Date", formatDateTime(toDateTime(carePlan.getEndDate())));

            addSectionHeader(document, "Patient Information");
            addPatientInfo(document, patient);

            addSectionHeader(document, "Doctor Information");
            addDoctorInfo(document, doctor);

            addSectionHeader(document, "Notes");
            document.add(new Paragraph(safe(carePlan.getNotes()), bodyFont()));

            addSectionHeader(document, "Goals");
            addGoalsTable(document, goals);

            addSectionHeader(document, "Actions");
            addActionsTable(document, actions);

            addSignatureBlock(document);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate PDF", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportPrescription(UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found"));

        Patient patient = prescription.getPatient();
        User doctor = findUser(prescription.getCreatedBy());
        PatientDiagnosis diagnosis = prescription.getDiagnosis();

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescriptionId);

        Document document = createDocument();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addTitle(document, "Prescription");
            addMetaLine(document, "Prescription ID", prescription.getId().toString());
            addMetaLine(document, "Status", prescription.getStatus().name());
            addMetaLine(document, "Issued At", formatDateTime(prescription.getIssuedAt()));
            addMetaLine(document, "Created At", formatDateTime(prescription.getCreatedAt()));

            addSectionHeader(document, "Patient Information");
            addPatientInfo(document, patient);

            addSectionHeader(document, "Doctor Information");
            addDoctorInfo(document, doctor);

            addSectionHeader(document, "Diagnosis");
            if (diagnosis != null) {
                document.add(new Paragraph(
                        diagnosis.getIcd10Code().getCode() + " - " + diagnosis.getIcd10Code().getDescription(),
                        bodyFont()));
            } else {
                document.add(new Paragraph("N/A", bodyFont()));
            }

            addSectionHeader(document, "Items");
            addPrescriptionItemsTable(document, items);

            addSignatureBlock(document);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new RuntimeException("Failed to generate PDF", ex);
        }
    }

    private Document createDocument() {
        return new Document(PageSize.A4, 36, 36, 48, 48);
    }

    private void addTitle(Document document, String title) throws DocumentException {
        Paragraph heading = new Paragraph(title, titleFont());
        heading.setAlignment(Element.ALIGN_CENTER);
        document.add(heading);
        Paragraph subtitle = new Paragraph("Family Medicine EMR", subtitleFont());
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(Chunk.NEWLINE);
    }

    private void addSectionHeader(Document document, String text) throws DocumentException {
        Paragraph header = new Paragraph(text, sectionFont());
        header.setSpacingBefore(8);
        header.setSpacingAfter(4);
        document.add(header);
    }

    private void addMetaLine(Document document, String label, String value) throws DocumentException {
        Paragraph paragraph = new Paragraph(label + ": " + safe(value), bodyFont());
        paragraph.setSpacingAfter(2);
        document.add(paragraph);
    }

    private void addPatientInfo(Document document, Patient patient) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(6);
        table.addCell(cell("Name", true));
        table.addCell(cell(patient.getFullName(), false));
        table.addCell(cell("Patient Code", true));
        table.addCell(cell(patient.getPatientCode(), false));
        table.addCell(cell("Date of Birth", true));
        table.addCell(cell(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : "", false));
        table.addCell(cell("Gender", true));
        table.addCell(cell(patient.getGender() != null ? patient.getGender().name() : "", false));
        table.addCell(cell("Phone", true));
        table.addCell(cell(patient.getPhoneNumber(), false));
        table.addCell(cell("Email", true));
        table.addCell(cell(patient.getEmail(), false));
        document.add(table);
    }

    private void addDoctorInfo(Document document, User doctor) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(6);
        table.addCell(cell("Doctor", true));
        table.addCell(cell(doctor != null ? doctor.getFullName() : "", false));
        table.addCell(cell("Email", true));
        table.addCell(cell(doctor != null ? doctor.getEmail() : "", false));
        table.addCell(cell("Role", true));
        table.addCell(cell(doctor != null && doctor.getRole() != null ? doctor.getRole().getRoleCode() : "", false));
        document.add(table);
    }

    private void addRiskInfo(Document document, Map<String, Object> risk) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(6);
        table.addCell(cell("Risk Percentage", true));
        table.addCell(cell(safe(toString(risk.get("riskPercentage"))), false));
        table.addCell(cell("Risk Level", true));
        table.addCell(cell(safe(toString(risk.get("riskLevel"))), false));
        table.addCell(cell("Result", true));
        table.addCell(cell(safe(toString(risk.get("diagnosticResult"))), false));
        document.add(table);
    }

    private void addAnswerTable(Document document, List<AssessmentAnswer> answers) throws DocumentException {
        if (answers.isEmpty()) {
            document.add(new Paragraph("No responses available", bodyFont()));
            return;
        }

        PdfPTable table = new PdfPTable(new float[] {2.5f, 5f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.addCell(headerCell("Question"));
        table.addCell(headerCell("Answer"));

        for (AssessmentAnswer answer : answers) {
            table.addCell(cell(answer.getQuestionText(), false));
            table.addCell(cell(answer.getAnswerValue(), false));
        }

        document.add(table);
    }

    private void addGoalsTable(Document document, List<CarePlanGoal> goals) throws DocumentException {
        if (goals.isEmpty()) {
            document.add(new Paragraph("No goals recorded", bodyFont()));
            return;
        }

        PdfPTable table = new PdfPTable(new float[] {3f, 2f, 2f, 1.5f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.addCell(headerCell("Goal"));
        table.addCell(headerCell("Target"));
        table.addCell(headerCell("Target Date"));
        table.addCell(headerCell("Status"));

        for (CarePlanGoal goal : goals) {
            table.addCell(cell(goal.getGoalDescription(), false));
            table.addCell(cell(goal.getTargetValue(), false));
            table.addCell(cell(goal.getTargetDate() != null ? goal.getTargetDate().toString() : "", false));
            table.addCell(cell(goal.getStatus() != null ? goal.getStatus().name() : "", false));
        }

        document.add(table);
    }

    private void addActionsTable(Document document, List<CarePlanAction> actions) throws DocumentException {
        if (actions.isEmpty()) {
            document.add(new Paragraph("No actions recorded", bodyFont()));
            return;
        }

        PdfPTable table = new PdfPTable(new float[] {1.7f, 3f, 1.5f, 1.2f, 1.3f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.addCell(headerCell("Type"));
        table.addCell(headerCell("Description"));
        table.addCell(headerCell("Frequency"));
        table.addCell(headerCell("Duration"));
        table.addCell(headerCell("Status"));

        for (CarePlanAction action : actions) {
            table.addCell(cell(action.getActionType() != null ? action.getActionType().name() : "", false));
            table.addCell(cell(action.getDescription(), false));
            table.addCell(cell(action.getFrequency(), false));
            table.addCell(cell(action.getDuration(), false));
            table.addCell(cell(action.getStatus() != null ? action.getStatus().name() : "", false));
        }

        document.add(table);
    }

    private void addPrescriptionItemsTable(Document document, List<PrescriptionItem> items) throws DocumentException {
        if (items.isEmpty()) {
            document.add(new Paragraph("No items recorded", bodyFont()));
            return;
        }

        PdfPTable table = new PdfPTable(new float[] {2.5f, 1.2f, 1.2f, 1.2f, 1.2f, 2.2f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.addCell(headerCell("Drug"));
        table.addCell(headerCell("Dosage"));
        table.addCell(headerCell("Route"));
        table.addCell(headerCell("Frequency"));
        table.addCell(headerCell("Duration"));
        table.addCell(headerCell("Instructions"));

        for (PrescriptionItem item : items) {
            table.addCell(cell(item.getDrugName(), false));
            table.addCell(cell(item.getDosage(), false));
            table.addCell(cell(item.getRoute(), false));
            table.addCell(cell(item.getFrequency(), false));
            table.addCell(cell(item.getDuration(), false));
            table.addCell(cell(item.getInstructions(), false));
        }

        document.add(table);
    }

    private void addSignatureBlock(Document document) throws DocumentException {
        document.add(Chunk.NEWLINE);
        Paragraph label = new Paragraph("Signature:", bodyFont());
        label.setSpacingBefore(6);
        document.add(label);
        document.add(new Paragraph("______________________________", bodyFont()));
        document.add(new Paragraph("Date: " + DATE_TIME.format(LocalDateTime.now()), bodyFont()));
    }

    private PdfPCell headerCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont()));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
        return cell;
    }

    private PdfPCell cell(String text, boolean label) {
        Font font = label ? labelFont() : bodyFont();
        PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String toString(Object value) {
        return value == null ? null : value.toString();
    }

    private String formatDateTime(LocalDateTime value) {
        return value == null ? "" : DATE_TIME.format(value);
    }

    private LocalDateTime toDateTime(java.time.LocalDate date) {
        return date == null ? null : date.atStartOfDay();
    }

    private User findUser(UUID userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }

    private Font titleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
    }

    private Font subtitleFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 12);
    }

    private Font sectionFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13);
    }

    private Font headerFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    }

    private Font labelFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    }

    private Font bodyFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 10);
    }
}
