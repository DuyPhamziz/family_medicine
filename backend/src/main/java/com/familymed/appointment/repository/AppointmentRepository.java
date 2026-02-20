package com.familymed.appointment.repository;

import com.familymed.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientPatientIdOrderByScheduledStartDesc(UUID patientId);

    List<Appointment> findByPatientPatientIdAndScheduledStartAfterAndStatusInOrderByScheduledStartAsc(
            UUID patientId,
            java.time.LocalDateTime scheduledStart,
            java.util.List<Appointment.Status> statuses);

        long countByPractitionerUserIdAndScheduledStartBetween(UUID practitionerId,
                                   java.time.LocalDateTime start,
                                   java.time.LocalDateTime end);

        @Query("select a from Appointment a join fetch a.patient p " +
            "where a.practitioner.userId = :doctorId " +
            "and a.scheduledStart between :start and :end " +
            "order by a.scheduledStart asc")
        List<Appointment> findTodayByDoctor(@Param("doctorId") UUID doctorId,
                        @Param("start") java.time.LocalDateTime start,
                        @Param("end") java.time.LocalDateTime end);

        @Query("select a.status, count(a) from Appointment a " +
            "where a.practitioner.userId = :doctorId " +
            "and a.scheduledStart between :start and :end " +
            "group by a.status")
        List<Object[]> countTodayByStatus(@Param("doctorId") UUID doctorId,
                          @Param("start") java.time.LocalDateTime start,
                          @Param("end") java.time.LocalDateTime end);

                @Query("select a from Appointment a " +
                    "join fetch a.patient p " +
                    "join fetch a.practitioner pr " +
                    "where p.patientId = :patientId " +
                    "order by a.scheduledStart asc")
            List<Appointment> findByPatientWithPractitioner(@Param("patientId") UUID patientId);
}
