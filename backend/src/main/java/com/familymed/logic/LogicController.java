package com.familymed.logic;

import com.familymed.common.ApiResponse;
import com.familymed.logic.dto.LogicFormulaRequest;
import com.familymed.logic.dto.LogicFormulaResponse;
import com.familymed.logic.dto.LogicVariableRequest;
import com.familymed.logic.dto.LogicVariableResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logic")
@RequiredArgsConstructor
public class LogicController {

    private final LogicVariableRepository variableRepository;
    private final LogicFormulaRepository formulaRepository;

    @GetMapping("/variables")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','USER')")
    public ResponseEntity<ApiResponse<List<LogicVariableResponse>>> getVariables() {
        return ResponseEntity.ok(ApiResponse.success(variableRepository.findAll().stream()
                .map(LogicVariableResponse::fromEntity)
                .toList()));
    }

    @PostMapping("/variables")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LogicVariableResponse>> createVariable(@Valid @RequestBody LogicVariableRequest request) {
        LogicVariable variable = new LogicVariable();
        variable.setVariableName(request.getVariableName());
        variable.setVariableCode(request.getVariableCode());
        variable.setUnit(request.getUnit());
        return ResponseEntity.ok(ApiResponse.success(LogicVariableResponse.fromEntity(variableRepository.save(variable))));
    }

    @PutMapping("/variables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LogicVariableResponse>> updateVariable(
            @PathVariable UUID id,
            @Valid @RequestBody LogicVariableRequest request) {
        LogicVariable variable = variableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Variable not found"));
        variable.setVariableName(request.getVariableName());
        variable.setVariableCode(request.getVariableCode());
        variable.setUnit(request.getUnit());
        return ResponseEntity.ok(ApiResponse.success(LogicVariableResponse.fromEntity(variableRepository.save(variable))));
    }

    @DeleteMapping("/variables/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVariable(@PathVariable UUID id) {
        variableRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/formulas")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','USER')")
    public ResponseEntity<ApiResponse<List<LogicFormulaResponse>>> getFormulas() {
        return ResponseEntity.ok(ApiResponse.success(formulaRepository.findAll().stream()
                .map(LogicFormulaResponse::fromEntity)
                .toList()));
    }

    @PostMapping("/formulas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LogicFormulaResponse>> createFormula(@Valid @RequestBody LogicFormulaRequest request) {
        LogicFormula formula = new LogicFormula();
        formula.setFormulaName(request.getFormulaName());
        formula.setFormulaCode(request.getFormulaCode());
        formula.setExpression(request.getExpression());
        return ResponseEntity.ok(ApiResponse.success(LogicFormulaResponse.fromEntity(formulaRepository.save(formula))));
    }

    @PutMapping("/formulas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LogicFormulaResponse>> updateFormula(
            @PathVariable UUID id,
            @Valid @RequestBody LogicFormulaRequest request) {
        LogicFormula formula = formulaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formula not found"));
        formula.setFormulaName(request.getFormulaName());
        formula.setFormulaCode(request.getFormulaCode());
        formula.setExpression(request.getExpression());
        return ResponseEntity.ok(ApiResponse.success(LogicFormulaResponse.fromEntity(formulaRepository.save(formula))));
    }

    @DeleteMapping("/formulas/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFormula(@PathVariable UUID id) {
        formulaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
