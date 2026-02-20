package com.familymed.prescription.repository;

import com.familymed.prescription.entity.Prescription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByPatientPatientIdOrderByCreatedAtDesc(UUID patientId);

    List<Prescription> findByPatientPatientIdAndStatusOrderByCreatedAtDesc(UUID patientId, Prescription.Status status);

        long countByCreatedByAndStatus(UUID createdBy, Prescription.Status status);

        @Query("select p from Prescription p join fetch p.patient pt " +
            "where p.createdBy = :doctorId and p.status = :status " +
            "order by p.issuedAt desc")
        List<Prescription> findRecentByDoctorAndStatus(@Param("doctorId") UUID doctorId,
                               @Param("status") Prescription.Status status,
                               Pageable pageable);

        @Query("select p.status, count(p) from Prescription p " +
            "where p.createdBy = :doctorId group by p.status")
        List<Object[]> countByStatusForDoctor(@Param("doctorId") UUID doctorId);

            @Query("select p from Prescription p " +
                "join fetch p.patient pt " +
                "left join fetch p.diagnosis d " +
                "left join fetch p.carePlan c " +
                "where pt.patientId = :patientId " +
                "order by p.createdAt asc")
            List<Prescription> findByPatientWithJoins(@Param("patientId") UUID patientId);
}
