package com.familymed.form.entity;

import com.familymed.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "form_question_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FormQuestionOption extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "option_id", columnDefinition = "UUID")
    private UUID optionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private FormQuestion question;

    @Column(nullable = false)
    private String optionText;

    private String optionValue;

    private Integer optionOrder;

    private Integer points;

    @Column(name = "sub_fields_config", columnDefinition = "TEXT")
    private String subFieldsConfig; // JSON config for sub-fields when option is selected
                                    // Example: [{"key":"year","label":"Năm tiêm","type":"NUMBER"},
                                    //           {"key":"notes","label":"Ghi chú","type":"TEXT"}]
}
