package com.phucnguyen.agriai.module.notification.entity;
import com.phucnguyen.agriai.module.user.entity.User;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import com.phucnguyen.agriai.module.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

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
