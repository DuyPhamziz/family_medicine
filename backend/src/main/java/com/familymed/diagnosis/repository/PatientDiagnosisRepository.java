package com.familymed.diagnosis.repository;

import com.familymed.diagnosis.entity.PatientDiagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PatientDiagnosisRepository extends JpaRepository<PatientDiagnosis, UUID> {
    List<PatientDiagnosis> findByPatientPatientIdOrderByDiagnosedAtDesc(UUID patientId);

        @Query("select d from PatientDiagnosis d " +
            "join fetch d.patient p " +
            "join fetch d.icd10Code c " +
            "where p.patientId = :patientId " +
            "order by d.diagnosedAt asc")
    List<PatientDiagnosis> findByPatientWithCode(@Param("patientId") UUID patientId);
}
