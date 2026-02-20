package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFormVersionRequest {
    private String formName;
    private String description;
    private String category;
}
