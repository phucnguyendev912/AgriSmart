package com.phucnguyen.agriai.entity;

import java.time.LocalDateTime;
import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "Notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", length = 255)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "notificationType")
    private NotificationType notificationType;

    @Column(name = "isRead")
    private Boolean isRead;

    @Column(name = "readAt")
    private LocalDateTime readAt;
}
