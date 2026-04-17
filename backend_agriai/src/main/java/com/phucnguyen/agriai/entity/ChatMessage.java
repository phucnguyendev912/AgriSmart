package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.SenderType;
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

    @Column(name = "imageURL", length = 255)
    private String imageUrl;
}
