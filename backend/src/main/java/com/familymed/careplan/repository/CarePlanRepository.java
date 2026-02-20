package com.familymed.careplan.repository;

import com.familymed.careplan.entity.CarePlan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CarePlanRepository extends JpaRepository<CarePlan, UUID> {
    List<CarePlan> findByPatientPatientId(UUID patientId);

    java.util.Optional<CarePlan> findFirstByPatientPatientIdAndStatusOrderByCreatedAtDesc(UUID patientId, CarePlan.Status status);

        long countByPatientDoctorUserIdAndStatus(UUID doctorId, CarePlan.Status status);

        @Query("select c from CarePlan c join fetch c.patient p " +
            "where p.doctor.userId = :doctorId and c.status = :status " +
            "order by c.createdAt desc")
        List<CarePlan> findByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                         @Param("status") CarePlan.Status status,
                         Pageable pageable);

        @Query("select c.status, count(c) from CarePlan c " +
            "where c.patient.doctor.userId = :doctorId group by c.status")
        List<Object[]> countByStatusForDoctor(@Param("doctorId") UUID doctorId);

                @Query("select c from CarePlan c " +
                    "join fetch c.patient p " +
                    "left join fetch c.assessmentSession s " +
                    "where p.patientId = :patientId " +
                    "order by c.createdAt asc")
            List<CarePlan> findByPatientWithPatient(@Param("patientId") UUID patientId);
}
