package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SendChatMessageRequest — DTO nhận dữ liệu từ frontend khi người dùng gửi tin
 * nhắn.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendChatMessageRequest {
    @NotBlank(message = "Noi dung tin nhan khong duoc de trong.")
    private String messageContent;
}
