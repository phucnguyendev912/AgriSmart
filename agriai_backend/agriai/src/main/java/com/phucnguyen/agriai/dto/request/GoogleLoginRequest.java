package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Google ID token không được để trống.")
    private String idToken;
}
