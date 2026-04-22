package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "ChatSession")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChatSession extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "sessionTitle", length = 255)
    private String sessionTitle;

    @Column(name = "lastMessage", columnDefinition = "TEXT")
    private String lastMessage;

    @Column(name = "lastMessageAt")
    private java.time.LocalDateTime lastMessageAt;
}
