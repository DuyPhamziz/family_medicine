package com.familymed.analytics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Analytics Controller
 * Provides analytics data for admin dashboard
 */
@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get disease statistics (top diseases from medical history)
     */
    @GetMapping("/disease-statistics")
    public Map<String, Long> getDiseaseStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getDiseaseStatistics(from, to);
    }

    /**
     * Get form completion statistics
     */
    @GetMapping("/form-completion")
    public FormCompletionStatsDTO getFormCompletionStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getFormCompletionStats(from, to);
    }

    /**
     * Get patient metrics
     */
    @GetMapping("/patient-metrics")
    public PatientMetricsDTO getPatientMetrics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getPatientMetrics(from, to);
    }

    /**
     * Get disease trend over time
     */
    @GetMapping("/disease-trend")
    public Map<String, Object> getDiseaseTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getDiseaseTrend(from, to);
    }

    /**
     * Get completion rate trend over time
     */
    @GetMapping("/completion-trend")
    public Map<String, Object> getCompletionTrend(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return analyticsService.getCompletionTrend(from, to);
    }
}
