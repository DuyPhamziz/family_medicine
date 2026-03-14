package com.familymed.form.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicFormQuestionGroupDTO {
    private String questionGroup;
    private Boolean repeatable;
    private Integer maxRepeat;
    private String labelAddButton;
    private List<PublicFormQuestionDTO> questions;
}
