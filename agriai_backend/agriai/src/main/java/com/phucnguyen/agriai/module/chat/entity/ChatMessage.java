package com.phucnguyen.agriai.module.chat.entity;
import com.phucnguyen.agriai.module.attachment.entity.Attachment;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import com.phucnguyen.agriai.module.chat.enums.SenderType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ChatMessage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChatMessage extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sessionId")
    private ChatSession chatSession;

    @Enumerated(EnumType.STRING)
    @Column(name = "senderType")
    private SenderType senderType;

    @Column(name = "messageContent", columnDefinition = "TEXT")
    private String messageContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_id")
    private Attachment attachment;
}
