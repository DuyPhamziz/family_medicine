package com.familymed.admin.user;

import com.familymed.admin.user.dto.AdminUserCreateRequest;
import com.familymed.admin.user.dto.AdminUserResponse;
import com.familymed.admin.user.dto.AdminUserUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();

    AdminUserResponse createUser(AdminUserCreateRequest request);

    AdminUserResponse updateUser(UUID userId, AdminUserUpdateRequest request);
}
