package com.familymed.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Map;

/**
 * Analytics Repository
 * Query interface for analytics data
 * 
 * NOTE: The actual implementation depends on your database schema
 * and how medical history and submission data is stored
 */
@Repository
public interface AnalyticsRepository extends JpaRepository<Object, Object> {

    /**
     * Get disease statistics from medical history data
     * 
     * Expected SQL logic:
     * - Query form_submission_answers where question_code = 'MEDICAL_HISTORY'
     * - Parse JSON array answer value
     * - Count each disease/condition code
     * - Return top 10 by count
     */
    @Query(nativeQuery = true, value = """
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
    """)
    Map<String, Long> getDiseaseStatistics(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    /**
     * Get form completion statistics
     * 
     * Expected SQL logic:
     * - Query form_submissions with completion_percentage
     * - Count total submissions
     * - Count submissions with completion_percentage >= 80 (completed)
     * - Count submissions with completion_percentage < 80 (incomplete)
     * - Calculate average completion_percentage
     */
    FormCompletionStatsDTO getFormCompletionStats(
        LocalDate from,
        LocalDate to
    );

    /**
     * Get patient metrics
     * 
     * Expected SQL logic:
     * - Count distinct patients in submissions (totalPatients)
     * - Count patients with only 1 submission (newPatients)
     * - Count patients with >1 submission (returningPatients)
     * - Average age calculated from patient.date_of_birth
     * - Gender distribution from patient.gender column
     */
    PatientMetricsDTO getPatientMetrics(
        LocalDate from,
        LocalDate to
    );

    /**
     * Get disease trend over time
     */
    Map<String, Object> getDiseaseTrend(
        LocalDate from,
        LocalDate to
    );

    /**
     * Get completion rate trend over time
     */
    Map<String, Object> getCompletionTrend(
        LocalDate from,
        LocalDate to
    );
}
