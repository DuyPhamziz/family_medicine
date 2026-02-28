package com.familymed.form.service;

import com.familymed.form.entity.DiagnosticForm;
import com.familymed.form.repository.DiagnosticFormRepository;
import com.familymed.form.entity.FormQuestion;
import com.familymed.form.repository.FormQuestionRepository;
import com.familymed.form.assessment.entity.AssessmentAnswer;
import com.familymed.form.assessment.repository.AssessmentAnswerRepository;
import com.familymed.form.assessment.entity.AssessmentSession;
import com.familymed.form.assessment.repository.AssessmentSessionRepository;
import com.familymed.form.dto.AssessmentAnswerDTO;
import com.familymed.form.dto.AssessmentSessionDTO;
import com.familymed.form.dto.AssessmentSessionDetailDTO;
import com.familymed.form.dto.CompleteAssessmentRequest;
import com.familymed.form.dto.StartAssessmentRequest;
import com.familymed.form.dto.SubmitAnswerRequest;
import com.familymed.form.repository.FormSectionRepository;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import com.familymed.common.CurrentUserProvider;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentSessionRepository sessionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DiagnosticFormRepository formRepository;
    private final FormQuestionRepository questionRepository;
    private final FormSectionRepository sectionRepository;
    private final AssessmentExportService assessmentExportService;
    private final AuditLogService auditLogService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public AssessmentSessionDTO startSession(StartAssessmentRequest request, UUID doctorId) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        DiagnosticForm form = formRepository.findById(request.getFormId())
                .orElseThrow(() -> new RuntimeException("Form not found"));

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        AssessmentSession session = new AssessmentSession();
        session.setSessionId(UUID.randomUUID());
        session.setPatient(patient);
        session.setForm(form);
        session.setDoctor(doctor);
        session.setStatus(AssessmentSession.SessionStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());

        AssessmentSession saved = sessionRepository.save(session);
        auditLogService.logAction(
            AuditActionType.RECORD_CREATED,
            "ASSESSMENT_SESSION",
            saved.getSessionId().toString(),
            doctorId);
        return AssessmentSessionDTO.fromSession(saved);
    }

    @Transactional(readOnly = true)
    public AssessmentSessionDetailDTO getSessionDetails(UUID sessionId) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<AssessmentAnswer> answers = answerRepository.findBySessionSessionIdOrderByAnsweredAtDesc(sessionId);
        Map<UUID, AssessmentAnswer> latestByQuestion = new LinkedHashMap<>();
        for (AssessmentAnswer answer : answers) {
            if (!latestByQuestion.containsKey(answer.getQuestionId())) {
                latestByQuestion.put(answer.getQuestionId(), answer);
            }
        }

        List<AssessmentAnswerDTO> latestAnswers = latestByQuestion.values().stream()
                .map(AssessmentAnswerDTO::fromAnswer)
                .toList();

        return AssessmentSessionDetailDTO.builder()
                .session(AssessmentSessionDTO.fromSession(session))
                .answers(latestAnswers)
                .build();
    }

    @Transactional
    public AssessmentAnswerDTO submitAnswer(UUID sessionId, SubmitAnswerRequest request) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != AssessmentSession.SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Session is not active");
        }

        FormQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (!question.getSection().getForm().getFormId().equals(session.getForm().getFormId())) {
            throw new RuntimeException("Question does not belong to the form");
        }

        AssessmentAnswer.AnswerType answerType = AssessmentAnswer.AnswerType.valueOf(request.getAnswerType());
        validateAnswerType(question.getQuestionType(), answerType);

        AssessmentAnswer answer = new AssessmentAnswer();
        answer.setAnswerId(UUID.randomUUID());
        answer.setSession(session);
        answer.setQuestionId(question.getQuestionId());
        answer.setQuestionCode(question.getQuestionCode());
        answer.setQuestionText(question.getQuestionText());
        answer.setAnswerType(answerType);
        answer.setAnswerValue(request.getAnswerValue());
        answer.setAnsweredAt(LocalDateTime.now());
        answer.setQuestionCode(question.getQuestionCode()); // THÊM DÒNG NÀY ĐỂ LƯU MÃ V3, V53...
        answer.setQuestionText(question.getQuestionText()); 

        AssessmentAnswer saved = answerRepository.save(answer);

        auditLogService.logAction(
            AuditActionType.RECORD_CREATED,
            "ASSESSMENT_ANSWER",
            saved.getAnswerId().toString(),
            currentUserProvider.getCurrentUser().getUserId());

        session.setUpdatedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return AssessmentAnswerDTO.fromAnswer(saved);
    }

    @Transactional
    public AssessmentSessionDTO completeSession(UUID sessionId, CompleteAssessmentRequest request) {
        AssessmentSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != AssessmentSession.SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Session is not active");
        }

        session.setStatus(AssessmentSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        session.setNotes(request.getNotes());

        AssessmentSession saved = sessionRepository.save(session);
        auditLogService.logAction(
            AuditActionType.RECORD_UPDATED,
            "ASSESSMENT_SESSION",
            saved.getSessionId().toString(),
            currentUserProvider.getCurrentUser().getUserId());
        return AssessmentSessionDTO.fromSession(saved);
    }

    private void validateAnswerType(FormQuestion.QuestionType questionType, AssessmentAnswer.AnswerType answerType) {
        if (questionType == FormQuestion.QuestionType.TEXT && answerType != AssessmentAnswer.AnswerType.TEXT) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.NUMBER && answerType != AssessmentAnswer.AnswerType.NUMBER) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.DATE && answerType != AssessmentAnswer.AnswerType.DATE) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.BOOLEAN && answerType != AssessmentAnswer.AnswerType.BOOLEAN) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.SINGLE_CHOICE && answerType != AssessmentAnswer.AnswerType.SINGLE_CHOICE) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.MULTIPLE_CHOICE && answerType != AssessmentAnswer.AnswerType.MULTIPLE_CHOICE) {
            throw new RuntimeException("Invalid answer type for question");
        }
        if (questionType == FormQuestion.QuestionType.IMAGE_UPLOAD && answerType != AssessmentAnswer.AnswerType.IMAGE_UPLOAD) {
            throw new RuntimeException("Invalid answer type for question");
        }
    }

    @Transactional(readOnly = true)
    public void exportToExcel(UUID formId, OutputStream outputStream) throws IOException {
        assessmentExportService.exportFormsToExcel(List.of(formId), outputStream);
    }

    @Transactional(readOnly = true)
    public void exportFormsToExcel(List<UUID> formIds, OutputStream outputStream) throws IOException {
        assessmentExportService.exportFormsToExcel(formIds, outputStream);
    }
}
