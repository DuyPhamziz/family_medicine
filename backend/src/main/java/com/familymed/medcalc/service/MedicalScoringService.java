package com.familymed.medcalc.service;

import com.familymed.medcalc.model.ScoringResult;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MedicalScoringService {

    public ScoringResult compute(String formula, Map<String, Object> inputs) {
        if (formula == null || formula.isBlank()) {
            throw new IllegalArgumentException("Formula is required");
        }

        Map<String, Object> safeInputs = inputs == null ? Map.of() : inputs;
        String normalized = formula.trim().toUpperCase().replace('-', '_').replace(' ', '_');

        return switch (normalized) {
            case "CHA2DS2_VASC", "CHA2DS2VASc", "CHA2DS2VASC" -> cha2ds2Vasc(safeInputs);
            case "WELLS_PE", "WELLSPE" -> wellsPe(safeInputs);
            case "WELLS_DVT", "WELLSDVT" -> wellsDvt(safeInputs);
            case "TIMI", "TIMI_RISK", "TIMI_RISK_SCORE" -> timi(safeInputs);
            case "HEART", "HEART_SCORE" -> heart(safeInputs);
            case "SIRS", "SIRS_CRITERIA" -> sirs(safeInputs);
            case "SOFA", "SOFA_SCORE" -> sofa(safeInputs);
            case "QSOFA" -> qsofa(safeInputs);
            case "NIHSS", "NIH_STROKE_SCALE" -> nihss(safeInputs);
            case "CURB65", "CURB_65" -> curb65(safeInputs);
            default -> throw new IllegalArgumentException("Unsupported formula: " + formula);
        };
    }

    private ScoringResult cha2ds2Vasc(Map<String, Object> inputs) {
        int age = intValue(inputs, "age");
        double score =
                bool(inputs, "congestiveHeartFailure")
                + bool(inputs, "hypertension")
                + bool(inputs, "diabetes")
                + bool(inputs, "vascularDisease")
                + bool(inputs, "femaleSex")
                + (age >= 75 ? 2 : (age >= 65 ? 1 : 0))
            + (bool(inputs, "strokeTiaThromboembolism") * 2);

        String interpretation = score >= 2
                ? "High stroke risk"
                : score == 1 ? "Intermediate stroke risk" : "Low stroke risk";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult wellsPe(Map<String, Object> inputs) {
        double score =
            (bool(inputs, "clinicalSignsDvt") * 3.0)
            + (bool(inputs, "peMostLikely") * 3.0)
            + (bool(inputs, "heartRateOver100") * 1.5)
            + (bool(inputs, "immobilizationOrSurgery") * 1.5)
            + (bool(inputs, "previousDvtPe") * 1.5)
            + (bool(inputs, "hemoptysis") * 1.0)
            + (bool(inputs, "malignancy") * 1.0);

        String interpretation = score > 4 ? "PE likely" : "PE unlikely";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult wellsDvt(Map<String, Object> inputs) {
        double score =
                bool(inputs, "activeCancer")
                + bool(inputs, "paralysisImmobilization")
                + bool(inputs, "bedriddenRecentSurgery")
                + bool(inputs, "localizedTenderness")
                + bool(inputs, "entireLegSwollen")
                + bool(inputs, "calfSwelling3cm")
                + bool(inputs, "pittingEdema")
                + bool(inputs, "collateralSuperficialVeins")
                + bool(inputs, "previousDvt")
                + (bool(inputs, "alternativeDiagnosisAsLikely") * -2);

        String interpretation = score >= 3
                ? "High probability of DVT"
                : score >= 1 ? "Moderate probability of DVT" : "Low probability of DVT";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult timi(Map<String, Object> inputs) {
        double score =
                bool(inputs, "age65OrOlder")
                + bool(inputs, "threeOrMoreCadRiskFactors")
                + bool(inputs, "knownCadStenosis50")
                + bool(inputs, "aspirinUseLast7Days")
                + bool(inputs, "severeAnginaRecent")
                + bool(inputs, "stDeviation")
                + bool(inputs, "positiveCardiacMarkers");

        String interpretation = score >= 5
                ? "High risk"
                : score >= 3 ? "Intermediate risk" : "Low risk";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult heart(Map<String, Object> inputs) {
        int history = boundedInt(inputs, "history", 0, 2);
        int ecg = boundedInt(inputs, "ecg", 0, 2);
        int age = boundedInt(inputs, "age", 0, 2);
        int riskFactors = boundedInt(inputs, "riskFactors", 0, 2);
        int troponin = boundedInt(inputs, "troponin", 0, 2);
        double score = history + ecg + age + riskFactors + troponin;

        String interpretation = score >= 7
                ? "High risk"
                : score >= 4 ? "Moderate risk" : "Low risk";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult sirs(Map<String, Object> inputs) {
        int criteria =
                bool(inputs, "temperatureAbnormal")
                + bool(inputs, "heartRateOver90")
                + bool(inputs, "respiratoryRateOver20OrPaCO2Below32")
                + bool(inputs, "wbcAbnormal");

        String interpretation = criteria >= 2
                ? "SIRS criteria met"
                : "SIRS criteria not met";
        return new ScoringResult(criteria, interpretation);
    }

    private ScoringResult sofa(Map<String, Object> inputs) {
        int respiration = boundedInt(inputs, "respiration", 0, 4);
        int coagulation = boundedInt(inputs, "coagulation", 0, 4);
        int liver = boundedInt(inputs, "liver", 0, 4);
        int cardiovascular = boundedInt(inputs, "cardiovascular", 0, 4);
        int cns = boundedInt(inputs, "cns", 0, 4);
        int renal = boundedInt(inputs, "renal", 0, 4);
        double score = respiration + coagulation + liver + cardiovascular + cns + renal;

        String interpretation = score >= 10
                ? "High organ dysfunction risk"
                : score >= 7 ? "Moderate organ dysfunction risk" : "Low organ dysfunction risk";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult qsofa(Map<String, Object> inputs) {
        int score =
                bool(inputs, "alteredMentation")
                + bool(inputs, "respiratoryRate22OrMore")
                + bool(inputs, "systolicBp100OrLess");

        String interpretation = score >= 2
                ? "High risk of poor outcome"
                : "Lower risk of poor outcome";
        return new ScoringResult(score, interpretation);
    }

    private ScoringResult nihss(Map<String, Object> inputs) {
        int total = inputs.values().stream()
                .mapToInt(this::safeInt)
                .sum();

        String interpretation;
        if (total == 0) {
            interpretation = "No stroke symptoms";
        } else if (total <= 4) {
            interpretation = "Minor stroke";
        } else if (total <= 15) {
            interpretation = "Moderate stroke";
        } else if (total <= 20) {
            interpretation = "Moderate to severe stroke";
        } else {
            interpretation = "Severe stroke";
        }

        return new ScoringResult(total, interpretation);
    }

    private ScoringResult curb65(Map<String, Object> inputs) {
        int score =
                bool(inputs, "confusion")
                + bool(inputs, "ureaOver7")
                + bool(inputs, "respiratoryRate30OrMore")
                + bool(inputs, "lowBloodPressure")
                + bool(inputs, "age65OrOlder");

        String interpretation = score >= 3
                ? "High mortality risk"
                : score == 2 ? "Moderate mortality risk" : "Low mortality risk";
        return new ScoringResult(score, interpretation);
    }

    private int bool(Map<String, Object> inputs, String key) {
        Object value = inputs.get(key);
        if (value instanceof Boolean bool) {
            return bool ? 1 : 0;
        }
        if (value instanceof Number number) {
            return number.intValue() != 0 ? 1 : 0;
        }
        if (value instanceof String text) {
            String normalized = text.trim().toLowerCase();
            return ("true".equals(normalized) || "1".equals(normalized) || "yes".equals(normalized)) ? 1 : 0;
        }
        return 0;
    }

    private int intValue(Map<String, Object> inputs, String key) {
        return safeInt(inputs.get(key));
    }

    private int safeInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }

    private int boundedInt(Map<String, Object> inputs, String key, int min, int max) {
        int value = intValue(inputs, key);
        if (value < min) {
            return min;
        }
        return Math.min(value, max);
    }
}
