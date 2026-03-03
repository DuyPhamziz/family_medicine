package com.familymed.analytics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

/**
 * Analytics Service
 * Handles analytics data retrieval and processing
 */
@Service
public class AnalyticsService {

    @Autowired(required = false)
    private AnalyticsRepository analyticsRepository;

    /**
     * Get disease statistics from medical history submissions
     * Returns a map of disease name -> count
     */
    public Map<String, Long> getDiseaseStatistics(LocalDate from, LocalDate to) {
        if (analyticsRepository == null) {
            return new LinkedHashMap<>();
        }

        try {
            // Query submission_answers where answer contains medical history selections
            // Count occurrences of each disease/condition
            // Return top 10 sorted by count descending
            return analyticsRepository.getDiseaseStatistics(from, to);
        } catch (Exception e) {
            System.err.println("Error fetching disease statistics: " + e.getMessage());
            return new LinkedHashMap<>();
        }
    }

    /**
     * Get form completion statistics
     * Calculates average completion percentage and counts
     */
    public FormCompletionStatsDTO getFormCompletionStats(LocalDate from, LocalDate to) {
        if (analyticsRepository == null) {
            return new FormCompletionStatsDTO(0.0, 0L, 0L, 0L);
        }

        try {
            // Query submissions and their completion_percentage
            // Count submissions >= 80% as "completed"
            // Calculate average completion rate
            return analyticsRepository.getFormCompletionStats(from, to);
        } catch (Exception e) {
            System.err.println("Error fetching completion statistics: " + e.getMessage());
            return new FormCompletionStatsDTO(0.0, 0L, 0L, 0L);
        }
    }

    /**
     * Get patient metrics
     * Includes total patients, new patients, returning patients, average age, gender distribution
     */
    public PatientMetricsDTO getPatientMetrics(LocalDate from, LocalDate to) {
        if (analyticsRepository == null) {
            PatientMetricsDTO dto = new PatientMetricsDTO(0L, 0L, 0L, 0.0);
            dto.setGenderDistribution(new HashMap<>());
            return dto;
        }

        try {
            // Count total unique patients with submissions in date range
            // Count patients with only one submission (new)
            // Count patients with multiple submissions (returning)
            // Calculate average age from date of birth
            // Get gender distribution (male, female, other)
            return analyticsRepository.getPatientMetrics(from, to);
        } catch (Exception e) {
            System.err.println("Error fetching patient metrics: " + e.getMessage());
            PatientMetricsDTO dto = new PatientMetricsDTO(0L, 0L, 0L, 0.0);
            dto.setGenderDistribution(new HashMap<>());
            return dto;
        }
    }

    /**
     * Get disease trend over time
     * Returns disease counts grouped by week/month
     */
    public Map<String, Object> getDiseaseTrend(LocalDate from, LocalDate to) {
        try {
            if (analyticsRepository != null) {
                return analyticsRepository.getDiseaseTrend(from, to);
            }
            return new HashMap<>();
        } catch (Exception e) {
            System.err.println("Error fetching disease trend: " + e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Get completion rate trend over time
     * Returns completion rate grouped by week/month
     */
    public Map<String, Object> getCompletionTrend(LocalDate from, LocalDate to) {
        try {
            if (analyticsRepository != null) {
                return analyticsRepository.getCompletionTrend(from, to);
            }
            return new HashMap<>();
        } catch (Exception e) {
            System.err.println("Error fetching completion trend: " + e.getMessage());
            return new HashMap<>();
        }
    }
}
