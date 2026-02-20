package com.familymed.logic;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LogicFormulaRepository extends JpaRepository<LogicFormula, UUID> {
    Optional<LogicFormula> findByFormulaCode(String formulaCode);
}
