package com.phucnguyen.agriai.module.chat.dto.response;
import com.phucnguyen.agriai.module.attachment.dto.response.AttachmentResponse;

import com.phucnguyen.agriai.module.chat.entity.ChatMessage;
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
public class ChatMessageResponse {
    private Integer id;
    private SenderType senderType;
    private String messageContent;
    private LocalDateTime createdAt;
    private AttachmentResponse attachment;

    public static ChatMessageResponse fromEntity(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .senderType(message.getSenderType())
                .messageContent(message.getMessageContent())
                .createdAt(message.getCreatedAt())
                .attachment(message.getAttachment() != null ? AttachmentResponse.builder()
                        .id(message.getAttachment().getId())
                        .fileName(message.getAttachment().getFileName())
                        .fileUrl(message.getAttachment().getFileUrl())
                        .fileType(message.getAttachment().getFileType())
                        .fileSize(message.getAttachment().getFileSize())
                        .mimeType(message.getAttachment().getMimeType())
                        .category(message.getAttachment().getCategory())
                        .build() : null)
                .build();
    }
}
