package com.phucnguyen.agriai.module.chat.dto.response;

import com.phucnguyen.agriai.module.chat.entity.ChatSession;
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
public class ChatSessionResponse {
    private Integer id;
    private String sessionTitle;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    public static ChatSessionResponse fromEntity(ChatSession session) {
        return ChatSessionResponse.builder()
                .id(session.getId())
                .sessionTitle(session.getSessionTitle())
                .lastMessage(session.getLastMessage())
                .lastMessageAt(session.getLastMessageAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
