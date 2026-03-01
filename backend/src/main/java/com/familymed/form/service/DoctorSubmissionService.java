package com.familymed.form.service;

import com.familymed.form.dto.doctor.DoctorRespondRequest;
import com.familymed.form.dto.doctor.DoctorSubmissionAnswerDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionDetailDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionListItemDTO;
import com.familymed.form.dto.doctor.DoctorSubmissionStatsDTO;
import com.familymed.form.entity.PatientFormSubmission;
import com.familymed.form.entity.SubmissionAnswer;
import com.familymed.form.repository.PatientFormSubmissionRepository;
import com.familymed.form.repository.SubmissionAnswerRepository;
import com.familymed.notification.EmailDeliveryService;
import com.familymed.notification.ZaloDeliveryService;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DoctorSubmissionService {

    private final PatientFormSubmissionRepository submissionRepository;
    private final SubmissionAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final EmailDeliveryService emailDeliveryService;
    private final ZaloDeliveryService zaloDeliveryService;

    @Transactional(readOnly = true)
    public List<DoctorSubmissionListItemDTO> getSubmissions(PatientFormSubmission.SubmissionStatus status) {
        List<PatientFormSubmission> submissions = status == null
                ? submissionRepository.findAll()
                : submissionRepository.findByStatus(status);

        return submissions.stream().map(this::toListItem).toList();
    }

    @Transactional(readOnly = true)
    public DoctorSubmissionDetailDTO getSubmissionDetail(UUID submissionId) {
        PatientFormSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<DoctorSubmissionAnswerDTO> answers = answerRepository.findBySubmissionSubmissionId(submissionId)
                .stream()
                .map(this::toAnswerDto)
                .toList();

        return DoctorSubmissionDetailDTO.builder()
                .submissionId(submission.getSubmissionId())
                .patientName(resolvePatientName(submission))
                .phone(submission.getPhone())
                .email(submission.getEmail())
                .formTitle(submission.getForm() != null ? submission.getForm().getFormName() : null)
                .formVersion(submission.getFormVersionNumber())
                .status(submission.getStatus() != null ? submission.getStatus().name() : null)
                .totalScore(submission.getTotalScore())
                .riskLevel(submission.getRiskLevel())
                .doctorResponse(submission.getDoctorResponse())
                .responseMethod(submission.getResponseMethod() != null ? submission.getResponseMethod().name() : null)
                .createdAt(submission.getCreatedAt())
                .respondedAt(submission.getRespondedAt())
                .answers(answers)
                .build();
    }

    @Transactional
    public DoctorSubmissionDetailDTO respond(UUID submissionId, DoctorRespondRequest request, String actorUsername) {
        PatientFormSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        User doctor = userRepository.findByEmailOrUsername(actorUsername, actorUsername)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        submission.setDoctor(doctor);
        submission.setDoctorResponse(request.getResponseMessage());
        submission.setResponseMethod(request.getResponseMethod() == null
                ? PatientFormSubmission.ResponseMethod.NONE
                : request.getResponseMethod());
        submission.setStatus(PatientFormSubmission.SubmissionStatus.RESPONDED);
        submission.setRespondedAt(LocalDateTime.now());

        PatientFormSubmission saved = submissionRepository.save(submission);

        if (saved.getResponseMethod() == PatientFormSubmission.ResponseMethod.EMAIL && saved.getEmail() != null) {
            emailDeliveryService.sendDoctorResponse(saved.getEmail(), saved.getDoctorResponse());
        } else if (saved.getResponseMethod() == PatientFormSubmission.ResponseMethod.ZALO && saved.getPhone() != null) {
            zaloDeliveryService.sendDoctorResponse(saved.getPhone(), saved.getDoctorResponse());
        }

        return getSubmissionDetail(saved.getSubmissionId());
    }

    @Transactional(readOnly = true)
    public DoctorSubmissionStatsDTO getStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);

        // Tổng số submissions
        long total = submissionRepository.count();

        // Số submissions PENDING
        long pending = submissionRepository.findByStatus(PatientFormSubmission.SubmissionStatus.PENDING).size();

        // Số submissions RESPONDED
        long responded = submissionRepository.findByStatus(PatientFormSubmission.SubmissionStatus.RESPONDED).size();

        // Số submissions hôm nay
        List<PatientFormSubmission> all = submissionRepository.findAll();
        long submissionsToday = all.stream()
                .filter(s -> s.getCreatedAt() != null 
                        && !s.getCreatedAt().isBefore(startOfDay) 
                        && !s.getCreatedAt().isAfter(endOfDay))
                .count();

        // Số submissions nguy cơ cao (riskLevel = HIGH hoặc VERY_HIGH)
        long highRisk = all.stream()
                .filter(s -> {
                    String riskLevel = s.getRiskLevel();
                    return riskLevel != null && (riskLevel.equalsIgnoreCase("HIGH") || riskLevel.equalsIgnoreCase("VERY_HIGH"));
                })
                .count();

        // Số bệnh nhân unique (đếm theo email không null và không trống)
        long uniquePatients = all.stream()
                .filter(s -> s.getEmail() != null && !s.getEmail().isBlank())
                .map(s -> s.getEmail().toLowerCase().trim())
                .distinct()
                .count();

        return DoctorSubmissionStatsDTO.builder()
                .totalSubmissions(total)
                .pendingSubmissions(pending)
                .respondedSubmissions(responded)
                .submissionsToday(submissionsToday)
                .highRiskSubmissions(highRisk)
                .uniquePatients(uniquePatients)
                .build();
    }

    private DoctorSubmissionListItemDTO toListItem(PatientFormSubmission submission) {
        return DoctorSubmissionListItemDTO.builder()
                .submissionId(submission.getSubmissionId())
                .patientName(resolvePatientName(submission))
                .phone(submission.getPhone())
                .email(submission.getEmail())
                .formTitle(submission.getForm() != null ? submission.getForm().getFormName() : null)
                .formVersion(submission.getFormVersionNumber())
                .status(submission.getStatus() != null ? submission.getStatus().name() : null)
                .totalScore(submission.getTotalScore())
                .riskLevel(submission.getRiskLevel())
                .createdAt(submission.getCreatedAt())
                .build();
    }

    private DoctorSubmissionAnswerDTO toAnswerDto(SubmissionAnswer answer) {
        return DoctorSubmissionAnswerDTO.builder()
                .questionId(answer.getQuestionId())
                .questionCode(answer.getQuestionCode())
                .value(answer.getValue())
                .build();
    }

    private String resolvePatientName(PatientFormSubmission submission) {
        if (submission.getPatientName() != null && !submission.getPatientName().isBlank()) {
            return submission.getPatientName();
        }
        if (submission.getPatient() != null) {
            return submission.getPatient().getFullName();
        }
        return "N/A";
    }
}
