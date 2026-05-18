package com.phucnguyen.agriai.dto.response.admin;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserResponse {

    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String roleName;
    private Integer roleId;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
