package com.familymed.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO for patient metrics
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientMetricsDTO {
    private Long totalPatients;
    private Long newPatients;      // First submission in date range
    private Long returningPatients; // Multiple submissions in date range
    private Double averageAge;
    private Map<String, Long> genderDistribution; // {male, female, other}

    public PatientMetricsDTO(Long totalPatients, Long newPatients, Long returningPatients, Double averageAge) {
        this.totalPatients = totalPatients;
        this.newPatients = newPatients;
        this.returningPatients = returningPatients;
        this.averageAge = averageAge;
        this.genderDistribution = new HashMap<>();
    }
}
