package com.familymed.icd10.dto;

import com.familymed.icd10.entity.Icd10Code;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Icd10CodeResponse {
    private String code;
    private String description;
    private String chapter;
    private Boolean billable;

    public static Icd10CodeResponse fromEntity(Icd10Code code) {
        return Icd10CodeResponse.builder()
                .code(code.getCode())
                .description(code.getDescription())
                .chapter(code.getChapter())
                .billable(code.getBillable())
                .build();
    }
}
