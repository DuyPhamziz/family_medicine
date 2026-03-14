package com.familymed.form.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixFamilyDiseaseConfigDTO {
    private List<Map<String, Object>> rows;
    private List<Map<String, Object>> columns;
    private Boolean allowAdditionalColumn;
    private Boolean allowAdditionalRow;
}
