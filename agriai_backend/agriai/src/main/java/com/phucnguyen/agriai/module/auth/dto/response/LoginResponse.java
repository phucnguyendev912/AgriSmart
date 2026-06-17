package com.phucnguyen.agriai.module.auth.dto.response;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {
    private String token;
    private String refreshToken;
    private UserResponse user;
}
