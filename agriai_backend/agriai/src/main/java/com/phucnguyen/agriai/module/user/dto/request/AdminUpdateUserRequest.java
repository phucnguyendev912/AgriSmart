package com.phucnguyen.agriai.module.user.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUpdateUserRequest {

    private String fullName;

    private String phoneNumber;

    @NotNull(message = "Vai trò không được để trống")
    private Integer roleId;

    private Boolean isActive;
}
