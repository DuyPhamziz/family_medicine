package com.familymed.analytics;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;

/**
 * Analytics Repository Implementation
 * Provides analytics queries using native SQL
 */
@Repository
public class AnalyticsRepositoryImpl implements AnalyticsRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Map<String, Long> getDiseaseStatistics(LocalDate from, LocalDate to) {
        Query query = entityManager.createNativeQuery(
            """
            SELECT
                disease_code as name,
                COUNT(*) as count
            FROM (
                SELECT jsonb_array_elements(answer)::text as disease_code
                FROM form_submission_answers
                WHERE question_code = 'MEDICAL_HISTORY'
                AND created_at BETWEEN :from AND :to
            ) AS exploded
            GROUP BY disease_code
            ORDER BY count DESC
            LIMIT 10
            """
        );
        query.setParameter("from", from);
        query.setParameter("to", to);

        Map<String, Long> result = new LinkedHashMap<>();
        List<Object[]> results = query.getResultList();
        for (Object[] row : results) {
            String diseaseCode = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            result.put(diseaseCode, count);
        }
        return result;
    }

    @Override
    public FormCompletionStatsDTO getFormCompletionStats(LocalDate from, LocalDate to) {
        Query query = entityManager.createNativeQuery(
            """
            SELECT
                CAST(AVG(completion_percentage) AS DECIMAL) as avg_completion,
                COUNT(*) as total_submissions,
                SUM(CASE WHEN completion_percentage >= 80 THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN completion_percentage < 80 THEN 1 ELSE 0 END) as incomplete
            FROM form_submissions
            WHERE created_at BETWEEN :from AND :to
            """
        );
        query.setParameter("from", from);
        query.setParameter("to", to);

        Object[] result = (Object[]) query.getSingleResult();
        double avgCompletion = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
        long totalSubmissions = ((Number) result[1]).longValue();
        long completed = result[2] != null ? ((Number) result[2]).longValue() : 0;
        long incomplete = result[3] != null ? ((Number) result[3]).longValue() : 0;

        return new FormCompletionStatsDTO(avgCompletion, totalSubmissions, completed, incomplete);
    }

    @Override
    public PatientMetricsDTO getPatientMetrics(LocalDate from, LocalDate to) {
        // Total patients and new/returning
        Query patientQuery = entityManager.createNativeQuery(
            """
            WITH patient_submissions AS (
                SELECT DISTINCT patient_id, COUNT(*) as submission_count
                FROM form_submissions
                WHERE created_at BETWEEN :from AND :to
                GROUP BY patient_id
            )
            SELECT
                (SELECT COUNT(DISTINCT patient_id) FROM form_submissions WHERE created_at BETWEEN :from AND :to) as total_patients,
                COUNT(CASE WHEN submission_count = 1 THEN 1 END) as new_patients,
                COUNT(CASE WHEN submission_count > 1 THEN 1 END) as returning_patients
            FROM patient_submissions
            """
        );
        patientQuery.setParameter("from", from);
        patientQuery.setParameter("to", to);

        Object[] patientResult = (Object[]) patientQuery.getSingleResult();
        long totalPatients = ((Number) patientResult[0]).longValue();
        long newPatients = ((Number) patientResult[1]).longValue();
        long returningPatients = ((Number) patientResult[2]).longValue();

        // Average age
        Query ageQuery = entityManager.createNativeQuery(
            """
            SELECT CAST(AVG(EXTRACT(YEAR FROM AGE(p.date_of_birth))) AS DECIMAL)
            FROM patients p
            WHERE p.id IN (
                SELECT DISTINCT patient_id FROM form_submissions
                WHERE created_at BETWEEN :from AND :to
            )
            """
        );
        ageQuery.setParameter("from", from);
        ageQuery.setParameter("to", to);

        Object ageResult = ageQuery.getSingleResult();
        double averageAge = ageResult != null ? ((Number) ageResult).doubleValue() : 0.0;

        PatientMetricsDTO dto = new PatientMetricsDTO(totalPatients, newPatients, returningPatients, averageAge);

        // Gender distribution
        Query genderQuery = entityManager.createNativeQuery(
            """
            SELECT p.gender, COUNT(*) as count
            FROM patients p
            WHERE p.id IN (
                SELECT DISTINCT patient_id FROM form_submissions
                WHERE created_at BETWEEN :from AND :to
            )
            GROUP BY p.gender
            """
        );
        genderQuery.setParameter("from", from);
        genderQuery.setParameter("to", to);

        Map<String, Long> genderDistribution = new HashMap<>();
        List<Object[]> genderResults = genderQuery.getResultList();
        for (Object[] row : genderResults) {
            String gender = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            genderDistribution.put(gender != null ? gender : "unknown", count);
        }
        dto.setGenderDistribution(genderDistribution);

        return dto;
    }

    @Override
    public Map<String, Object> getDiseaseTrend(LocalDate from, LocalDate to) {
        Query query = entityManager.createNativeQuery(
            """
            SELECT
                DATE_TRUNC('week', created_at)::date as week,
                jsonb_array_elements(answer)::text as disease_code,
                COUNT(*) as count
            FROM form_submission_answers
            WHERE question_code = 'MEDICAL_HISTORY'
            AND created_at BETWEEN :from AND :to
            GROUP BY DATE_TRUNC('week', created_at), disease_code
            ORDER BY week, disease_code
            """
        );
        query.setParameter("from", from);
        query.setParameter("to", to);

        Map<String, Object> result = new LinkedHashMap<>();
        List<Object[]> results = query.getResultList();
        for (Object[] row : results) {
            result.put(row[0] + "_" + row[1], row[2]);
        }
        return result;
    }

    @Override
    public Map<String, Object> getCompletionTrend(LocalDate from, LocalDate to) {
        Query query = entityManager.createNativeQuery(
            """
            SELECT
                DATE_TRUNC('week', created_at)::date as week,
                CAST(AVG(completion_percentage) AS DECIMAL) as avg_completion,
                COUNT(*) as submission_count
            FROM form_submissions
            WHERE created_at BETWEEN :from AND :to
            GROUP BY DATE_TRUNC('week', created_at)
            ORDER BY week
            """
        );
        query.setParameter("from", from);
        query.setParameter("to", to);

        Map<String, Object> result = new LinkedHashMap<>();
        List<Object[]> results = query.getResultList();
        for (Object[] row : results) {
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("avgCompletion", ((Number) row[1]).doubleValue());
            weekData.put("submissionCount", ((Number) row[2]).longValue());
            result.put(row[0].toString(), weekData);
        }
        return result;
    }
}
