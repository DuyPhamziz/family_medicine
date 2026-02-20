package com.familymed.logic;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "logic_formulas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogicFormula extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "formula_id", columnDefinition = "UUID")
    private UUID formulaId;

    @Column(nullable = false)
    private String formulaName;

    private String formulaCode;

    @Column(columnDefinition = "TEXT")
    private String expression;
}
