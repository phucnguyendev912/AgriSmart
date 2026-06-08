package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;
    @Email
    @NotBlank
    private String email;
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(03|05|07|08|09)\\d{8}$", message = "Số điện thoại không hợp lệ, phải gồm 10 chữ số và bắt đầu bằng các đầu số Việt Nam (03, 05, 07, 08, 09)")
    private String phoneNumber;
    @NotBlank
    private String password;
    @NotBlank
    private String passwordConfirm;
}
