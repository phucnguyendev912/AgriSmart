package com.phucnguyen.agriai.dto.response;

import com.phucnguyen.agriai.enums.SenderType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// ChatResponse — DTO response returned to the frontend after each message sent.
// Contains essential fields:
// - sessionId / messageId: For frontend identification and UI updates.
// - senderType: Distinguishes between USER and AI messages.
// - messageContent: Text content of the message.
// - createdAt: Message timestamp.
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
