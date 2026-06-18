package com.phucnguyen.agriai.module.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Pattern(regexp = "^(?!.*(\\d)\\1{4})(03|05|07|08|09)\\d{8}$", message = "Số điện thoại không hợp lệ, phải gồm 10 chữ số, bắt đầu bằng các đầu số Việt Nam (03, 05, 07, 08, 09) và không chứa 5 chữ số trùng nhau liên tiếp")
    private String phoneNumber;

    private Integer avatarAttachmentId;
}
