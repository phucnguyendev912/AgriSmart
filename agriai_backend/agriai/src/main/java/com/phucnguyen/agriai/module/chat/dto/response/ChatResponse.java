package com.phucnguyen.agriai.module.chat.dto.response;

import com.phucnguyen.agriai.module.chat.enums.SenderType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Integer sessionId;
    private Integer messageId;
    private SenderType senderType;
    private String messageContent;
    private LocalDateTime createdAt;
}
