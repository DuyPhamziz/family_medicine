package com.familymed.admin.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    private String roleCode;

    private Boolean active;
}
