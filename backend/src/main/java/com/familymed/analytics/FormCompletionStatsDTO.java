package com.familymed.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Map;

/**
 * DTO for form completion statistics
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormCompletionStatsDTO {
    private Double averageCompletion;  // 0-100
    private Long totalSubmissions;
    private Long completedSubmissions; // >= 80%
    private Long incompleteSubmissions; // < 80%
}
