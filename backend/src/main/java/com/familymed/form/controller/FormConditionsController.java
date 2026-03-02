package com.familymed.form.controller;

import com.familymed.form.service.ConditionalLogicEngine;
import com.familymed.form.entity.FormQuestion;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * API y tính toán điều kiện form realtime
 * Được dùng bởi frontend để hiện/ẩn/disable questions
 */
@RestController
@RequestMapping("/api/forms/conditions")
public class FormConditionsController {
    
    @Autowired
    private ConditionalLogicEngine conditionalLogicEngine;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Evaluate các điều kiện và trả về trạng thái hiển thị của các questions
     * POST /api/forms/conditions/evaluate
     * 
     * Body:
     * {
     *   "answers": {
     *     "Q1": "yes",
     *     "Q2": "30",
     *     "WEIGHT": "70",
     *     "HEIGHT": "175"
     *   },
     *   "questionConditions": [
     *     {
     *       "questionCode": "Q2",
     *       "displayCondition": "[{...}]"
     *     }
     *   ]
     * }
     */
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateConditions(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> answers = (Map<String, Object>) request.get("answers");
            if (answers == null) {
                answers = new HashMap<>();
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questionConditions = 
                    (List<Map<String, Object>>) request.get("questionConditions");
            
            Map<String, Object> results = new LinkedHashMap<>();
            
            if (questionConditions != null) {
                for (Map<String, Object> qc : questionConditions) {
                    String questionCode = (String) qc.get("questionCode");
                    String displayConditionJson = (String) qc.get("displayCondition");
                    
                    if (questionCode != null && displayConditionJson != null) {
                        try {
                            @SuppressWarnings("unchecked")
                            Map<String, String> stringAnswers = new HashMap<>();
                            answers.forEach((k, v) -> stringAnswers.put(k, v != null ? v.toString() : ""));
                            
                            ConditionalLogicEngine.ConditionalState state = 
                                    conditionalLogicEngine.evaluateConditions(displayConditionJson, stringAnswers);
                            
                            results.put(questionCode, new LinkedHashMap<>(
                                    Map.of(
                                            "visible", state.visible,
                                            "required", state.required,
                                            "disabled", state.disabled
                                    )
                            ));
                        } catch (Exception e) {
                            // Invalid condition JSON, skip
                            results.put(questionCode, Map.of(
                                    "visible", true,
                                    "required", false,
                                    "disabled", false,
                                    "error", "Invalid condition"
                            ));
                        }
                    }
                }
            }
            
            return ResponseEntity.ok(new LinkedHashMap<>(Map.of(
                    "status", "success",
                    "conditions", results
            )));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(
                    Map.of(
                            "status", "error",
                            "message", e.getMessage()
                    )
            );
        }
    }
    
    /**
     * Kiểm tra một điều kiện cụ thể
     * POST /api/forms/conditions/check
     * 
     * Body:
     * {
     *   "condition": {
     *     "targetQuestion": "Q1",
     *     "operator": "equals",
     *     "value": "yes"
     *   },
     *   "answers": {
     *     "Q1": "yes"
     *   }
     * }
     */
    @PostMapping("/check")
    public ResponseEntity<?> checkCondition(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> condition = (Map<String, Object>) request.get("condition");
            @SuppressWarnings("unchecked")
            Map<String, Object> answers = (Map<String, Object>) request.get("answers");
            
            if (answers == null) {
                answers = new HashMap<>();
            }
            
            boolean result = conditionalLogicEngine.evaluateSingleCondition(condition, answers);
            
            return ResponseEntity.ok(Map.of(
                    "result", result,
                    "condition", condition
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(
                    Map.of(
                            "error", e.getMessage()
                    )
            );
        }
    }
}
