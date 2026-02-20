package com.familymed.appointment;

import com.familymed.appointment.dto.AppointmentCreateRequest;
import com.familymed.appointment.dto.AppointmentResponse;
import com.familymed.appointment.entity.Appointment;
import com.familymed.appointment.repository.AppointmentRepository;
import com.familymed.audit.entity.AuditActionType;
import com.familymed.audit.AuditLogService;
import com.familymed.common.CurrentUserProvider;
import com.familymed.patient.entity.Patient;
import com.familymed.patient.repository.PatientRepository;
import com.familymed.user.entity.User;
import com.familymed.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;
        private final AuditLogService auditLogService;

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        if (request.getScheduledStart().isAfter(request.getScheduledEnd())) {
            throw new RuntimeException("Scheduled end must be after start");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        User practitioner = userRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new RuntimeException("Practitioner not found"));

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        Appointment appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setPatient(patient);
        appointment.setPractitioner(practitioner);
        appointment.setStatus(Appointment.Status.BOOKED);
        appointment.setScheduledStart(request.getScheduledStart());
        appointment.setScheduledEnd(request.getScheduledEnd());
        appointment.setReason(request.getReason());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setCreatedBy(userId);

        Appointment saved = appointmentRepository.save(appointment);

        auditLogService.logAction(
                AuditActionType.RECORD_CREATED,
                "APPOINTMENT",
                saved.getId().toString(),
                userId);

        logger.info("APPOINTMENT_CREATED appointmentId={} patientId={} practitionerId={} createdBy={}",
                saved.getId(), patient.getPatientId(), practitioner.getUserId(), userId);

        return AppointmentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        return AppointmentResponse.fromEntity(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findByPatientPatientIdOrderByScheduledStartDesc(patientId).stream()
                .map(AppointmentResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUpcomingAppointmentsByPatient(UUID patientId) {
        List<Appointment.Status> statuses = List.of(
                Appointment.Status.BOOKED,
                Appointment.Status.CONFIRMED,
                Appointment.Status.CHECKED_IN
        );

        return appointmentRepository
                .findByPatientPatientIdAndScheduledStartAfterAndStatusInOrderByScheduledStartAsc(
                        patientId,
                        LocalDateTime.now(),
                        statuses)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(UUID id, Appointment.Status status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        UUID userId = currentUserProvider.getCurrentUser().getUserId();

        appointment.setStatus(status);
        appointment.setUpdatedAt(LocalDateTime.now());
        appointment.setUpdatedBy(userId);

        Appointment saved = appointmentRepository.save(appointment);

        auditLogService.logAction(
                AuditActionType.RECORD_UPDATED,
                "APPOINTMENT",
                saved.getId().toString(),
                userId);

        logger.info("APPOINTMENT_STATUS_UPDATED appointmentId={} status={} updatedBy={}",
                saved.getId(), status, userId);

        return AppointmentResponse.fromEntity(saved);
    }
}
