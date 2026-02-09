package com.familymed.form.service;

import com.familymed.form.*;
import com.familymed.form.dto.DiagnosticFormDTO;
import com.familymed.form.dto.PatientFormSubmissionDTO;
import com.familymed.form.dto.SubmitFormRequest;
import com.familymed.patient.Patient;
import com.familymed.patient.PatientRepository;
import com.familymed.user.User;
import com.familymed.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class FormService {
    
    private final DiagnosticFormRepository formRepository;
    private final FormQuestionRepository questionRepository;
    private final PatientFormSubmissionRepository submissionRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final RiskCalculationService riskCalculationService;
    
    public DiagnosticFormDTO getFormWithQuestions(UUID formId) {
        DiagnosticForm form = formRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        List<FormQuestion> questions = questionRepository.findByForm_FormIdOrderByQuestionOrder(formId);
        
        return DiagnosticFormDTO.fromForm(form, questions);
    }
    
    public List<DiagnosticFormDTO> getAllActiveForms() {
        List<DiagnosticForm> forms = formRepository.findByStatus(DiagnosticForm.FormStatus.ACTIVE);
        return forms.stream().map(form -> {
            List<FormQuestion> questions = questionRepository.findByForm_FormIdOrderByQuestionOrder(form.getFormId());
            return DiagnosticFormDTO.fromForm(form, questions);
        }).toList();
    }
    
    public PatientFormSubmissionDTO submitForm(SubmitFormRequest request, UUID doctorId) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        DiagnosticForm form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // Tính toán điểm và kết quả
        Map<String, Object> result = calculateDiagnosticResult(form, request.getSubmissionData());
        
        PatientFormSubmission submission = new PatientFormSubmission();
        submission.setPatient(patient);
        submission.setForm(form);
        submission.setDoctor(doctor);
        submission.setSubmissionData(request.getSubmissionData());
        submission.setTotalScore((Double) result.get("totalScore"));
        submission.setRiskLevel((String) result.get("riskLevel"));
        submission.setDiagnosticResult((String) result.get("diagnosticResult"));
        submission.setNotes(request.getNotes());
        submission.setStatus(PatientFormSubmission.SubmissionStatus.COMPLETED);
        
        PatientFormSubmission savedSubmission = submissionRepository.save(submission);
        return PatientFormSubmissionDTO.fromSubmission(savedSubmission);
    }
    
    public List<PatientFormSubmissionDTO> getPatientSubmissions(UUID patientId) {
        List<PatientFormSubmission> submissions = submissionRepository.findByPatientPatientId(patientId);
        return submissions.stream().map(PatientFormSubmissionDTO::fromSubmission).toList();
    }
    
    public List<PatientFormSubmissionDTO> getDoctorSubmissions(UUID doctorId) {
        List<PatientFormSubmission> submissions = submissionRepository.findByDoctorUserId(doctorId);
        return submissions.stream().map(PatientFormSubmissionDTO::fromSubmission).toList();
    }
    
    private Map<String, Object> calculateDiagnosticResult(DiagnosticForm form, String submissionDataJson) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> submissionData = objectMapper.readValue(submissionDataJson, Map.class);
            
            // Use RiskCalculationService for advanced risk calculation
            Map<String, Object> riskResult = riskCalculationService.calculateRisk(
                    form.getFormName(), 
                    submissionData
            );
            
            // Add form-specific metadata
            riskResult.put("formName", form.getFormName());
            riskResult.put("formCategory", form.getCategory());
            
            return riskResult;
        } catch (Exception e) {
            throw new RuntimeException("Error calculating diagnostic result: " + e.getMessage());
        }
    }
    
    // ===== ADMIN FORM MANAGEMENT =====
    
    public DiagnosticFormDTO createForm(DiagnosticFormDTO dto) {
        DiagnosticForm form = new DiagnosticForm();
        form.setFormName(dto.getFormName());
        form.setDescription(dto.getDescription());
        form.setCategory(dto.getCategory());
        form.setVersion(1);
        form.setStatus(DiagnosticForm.FormStatus.ACTIVE);
        
        DiagnosticForm saved = formRepository.save(form);
        return DiagnosticFormDTO.fromForm(saved, List.of());
    }
    
    public DiagnosticFormDTO updateForm(UUID id, DiagnosticFormDTO dto) {
        DiagnosticForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        form.setFormName(dto.getFormName());
        form.setDescription(dto.getDescription());
        form.setCategory(dto.getCategory());
        
        DiagnosticForm updated = formRepository.save(form);
        List<FormQuestion> questions = questionRepository.findByForm_FormIdOrderByQuestionOrder(id);
        return DiagnosticFormDTO.fromForm(updated, questions);
    }
    
    public void deleteForm(UUID id) {
        DiagnosticForm form = formRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Form not found"));
        
        // Soft delete - set status to INACTIVE
        form.setStatus(DiagnosticForm.FormStatus.INACTIVE);
        formRepository.save(form);
    }
    
    public List<DiagnosticFormDTO> getAllForms() {
        List<DiagnosticForm> forms = formRepository.findAll();
        return forms.stream().map(form -> {
            List<FormQuestion> questions = questionRepository.findByForm_FormIdOrderByQuestionOrder(form.getFormId());
            return DiagnosticFormDTO.fromForm(form, questions);
        }).toList();
    }
}
