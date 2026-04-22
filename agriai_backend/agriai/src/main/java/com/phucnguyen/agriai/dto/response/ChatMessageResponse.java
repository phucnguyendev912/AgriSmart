package com.phucnguyen.agriai.dto.response;

import com.phucnguyen.agriai.entity.ChatMessage;
import com.phucnguyen.agriai.enums.SenderType;
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
// response for chat message
public class ChatMessageResponse {
    private Integer id;
    private SenderType senderType;
    private String messageContent;
    private LocalDateTime createdAt;

    // convert entity to response
    public static ChatMessageResponse fromEntity(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderType(message.getSenderType())
                .messageContent(message.getMessageContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
