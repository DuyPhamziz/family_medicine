package com.familymed.export.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ClinicalRiskEngine {

    public RiskAssessment evaluate(
            String baseRiskLevel,
            Double totalScore,
            Map<String, String> rawClinicalMetrics
    ) {
        List<String> redFlags = detectRedFlags(rawClinicalMetrics);

        int level = classifyLevel(baseRiskLevel, totalScore, redFlags);
        String levelLabel = switch (level) {
            case 1 -> "Level 1 - No risk";
            case 2 -> "Level 2 - Mild";
            case 3 -> "Level 3 - Intervention needed";
            default -> "Level 4 - Dangerous";
        };

        String color = switch (level) {
            case 3 -> "YELLOW";
            case 4 -> "RED";
            default -> "NONE";
        };

        List<String> carePlan = buildCarePlan(level, redFlags);
        String followUpTimeline = switch (level) {
            case 1 -> "Re-assess in 3-6 months";
            case 2 -> "Follow-up in 4-8 weeks";
            case 3 -> "Follow-up in 1-2 weeks";
            default -> "Immediate follow-up within 24-72 hours";
        };

        String referralSuggestion = level == 4
                ? "Urgent referral to specialist/emergency care is recommended."
                : "Referral based on clinician judgement and local protocol.";

        return new RiskAssessment(level, levelLabel, color, redFlags, carePlan, followUpTimeline, referralSuggestion);
    }

    private int classifyLevel(String baseRiskLevel, Double totalScore, List<String> redFlags) {
        if (!redFlags.isEmpty()) {
            return 4;
        }

        String normalized = baseRiskLevel == null ? "" : baseRiskLevel.trim().toUpperCase(Locale.ROOT);
        if (normalized.contains("VERY_HIGH") || normalized.contains("HIGH")) {
            return 4;
        }
        if (normalized.contains("MEDIUM")) {
            return 3;
        }
        if (normalized.contains("MILD") || normalized.contains("LIGHT") || normalized.contains("LOW")) {
            return 2;
        }
        if (normalized.contains("NORMAL") || normalized.contains("NO_RISK")) {
            return 1;
        }

        double score = totalScore == null ? 0d : totalScore;
        if (score >= 20) return 4;
        if (score >= 10) return 3;
        if (score > 0) return 2;
        return 1;
    }

    private List<String> detectRedFlags(Map<String, String> rawClinicalMetrics) {
        List<String> flags = new ArrayList<>();
        if (rawClinicalMetrics == null || rawClinicalMetrics.isEmpty()) {
            return flags;
        }

        for (Map.Entry<String, String> entry : rawClinicalMetrics.entrySet()) {
            String key = safe(entry.getKey()).toLowerCase(Locale.ROOT);
            String value = safe(entry.getValue()).toLowerCase(Locale.ROOT);
            String combined = key + " " + value;

            if (combined.contains("suicid") && isPositive(value)) {
                flags.add("Suicidal ideation detected");
            }

            if ((combined.contains("af") || combined.contains("atrial fibrillation"))
                    && (combined.contains("untreated") || isPositive(value))) {
                flags.add("Possible untreated atrial fibrillation");
            }

            if ((combined.contains("diabetes") || combined.contains("hba1c") || combined.contains("glucose"))
                    && (combined.contains("uncontrolled") || numericAtLeast(value, 9.0) || numericAtLeast(value, 250.0))) {
                flags.add("Uncontrolled diabetes warning");
            }

            if ((combined.contains("blood pressure") || combined.contains("bp") || combined.contains("huyết áp"))
                    && looksLikeSevereBp(value)) {
                flags.add("Severely elevated blood pressure");
            }
        }

        return flags.stream().distinct().toList();
    }

    private List<String> buildCarePlan(int level, List<String> redFlags) {
        List<String> plan = new ArrayList<>();
        plan.add("Continue standard monitoring and document symptoms.");
        if (level >= 2) {
            plan.add("Reinforce lifestyle and medication adherence counseling.");
        }
        if (level >= 3) {
            plan.add("Schedule clinician follow-up with focused intervention.");
        }
        if (level == 4) {
            plan.add("Escalate care immediately according to emergency protocol.");
            plan.add("Consider urgent specialist referral.");
        }
        if (!redFlags.isEmpty()) {
            plan.add("Address RED FLAG conditions before routine follow-up.");
        }
        return plan;
    }

    private boolean isPositive(String value) {
        String normalized = safe(value).toLowerCase(Locale.ROOT);
        return normalized.contains("yes")
                || normalized.contains("true")
                || normalized.contains("positive")
                || normalized.equals("1")
                || normalized.contains("có");
    }

    private boolean numericAtLeast(String value, double threshold) {
        try {
            String cleaned = safe(value).replaceAll("[^0-9.]+", "");
            if (cleaned.isBlank()) return false;
            return Double.parseDouble(cleaned) >= threshold;
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean looksLikeSevereBp(String value) {
        String normalized = safe(value);
        if (normalized.contains("/")) {
            String[] parts = normalized.split("/");
            if (parts.length == 2) {
                try {
                    int sys = Integer.parseInt(parts[0].replaceAll("[^0-9]", ""));
                    int dia = Integer.parseInt(parts[1].replaceAll("[^0-9]", ""));
                    return sys >= 180 || dia >= 120;
                } catch (Exception ignored) {
                    return false;
                }
            }
        }
        return false;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    public record RiskAssessment(
            int level,
            String levelLabel,
            String colorCode,
            List<String> redFlags,
            List<String> carePlan,
            String followUpTimeline,
            String referralSuggestion
    ) {
    }
}
