package com.familymed.logic;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LogicVariableRepository extends JpaRepository<LogicVariable, UUID> {
}
