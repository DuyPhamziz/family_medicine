package com.familymed.logic;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "logic_variables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogicVariable extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "variable_id", columnDefinition = "UUID")
    private UUID variableId;

    @Column(nullable = false)
    private String variableName;

    private String variableCode;

    private String unit;
}
