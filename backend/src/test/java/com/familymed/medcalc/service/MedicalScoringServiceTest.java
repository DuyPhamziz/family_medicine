package com.familymed.medcalc.service;

import com.familymed.medcalc.model.ScoringResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MedicalScoringServiceTest {

    private MedicalScoringService service;

    @BeforeEach
    void setUp() {
        service = new MedicalScoringService();
    }

    @Test
    void computesCha2ds2Vasc() {
        ScoringResult result = service.compute("CHA2DS2-VASc", Map.of(
                "age", 76,
                "hypertension", true,
                "diabetes", true,
                "strokeTiaThromboembolism", true,
                "femaleSex", true
        ));

        assertEquals(7.0, result.getScore());
        assertEquals("High stroke risk", result.getInterpretation());
    }

    @Test
    void computesWellsPe() {
        ScoringResult result = service.compute("WELLS_PE", Map.of(
                "clinicalSignsDvt", true,
                "peMostLikely", true
        ));

        assertEquals(6.0, result.getScore());
        assertEquals("PE likely", result.getInterpretation());
    }

    @Test
    void computesHeart() {
        ScoringResult result = service.compute("HEART", Map.of(
                "history", 2,
                "ecg", 1,
                "age", 1,
                "riskFactors", 0,
                "troponin", 0
        ));

        assertEquals(4.0, result.getScore());
        assertEquals("Moderate risk", result.getInterpretation());
    }

    @Test
    void computesQsofa() {
        ScoringResult result = service.compute("qSOFA", Map.of(
                "alteredMentation", true,
                "respiratoryRate22OrMore", true,
                "systolicBp100OrLess", false
        ));

        assertEquals(2.0, result.getScore());
        assertEquals("High risk of poor outcome", result.getInterpretation());
    }

    @Test
    void computesNihss() {
        ScoringResult result = service.compute("NIHSS", Map.of(
                "levelOfConsciousness", 2,
                "bestGaze", 1,
                "motorArmLeft", 3
        ));

        assertEquals(6.0, result.getScore());
        assertEquals("Moderate stroke", result.getInterpretation());
    }

    @Test
    void computesCurb65() {
        ScoringResult result = service.compute("CURB-65", Map.of(
                "confusion", true,
                "age65OrOlder", true,
                "respiratoryRate30OrMore", true
        ));

        assertEquals(3.0, result.getScore());
        assertEquals("High mortality risk", result.getInterpretation());
    }

    @Test
    void throwsForUnsupportedFormula() {
        assertThrows(IllegalArgumentException.class, () -> service.compute("UNKNOWN", Map.of()));
    }
}
