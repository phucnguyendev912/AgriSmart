package com.phucnguyen.agriai.module.user.entity;
import com.phucnguyen.agriai.module.attachment.entity.Attachment;

<<<<<<< HEAD:agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/module/user/entity/User.java
import com.phucnguyen.agriai.shared.entity.BaseEntity;
import com.phucnguyen.agriai.module.auth.enums.AuthProvider;
=======
import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.AuthProvider;
>>>>>>> origin/main:agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/User.java
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity {
    @Column(name = "fullName", length = 100)
    private String fullName;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @Column(name = "phoneNumber", length = 20)
    private String phoneNumber;

    @Column(name = "passwordHash", length = 255)
    private String passwordHash; // nullable for social login users

    @Column(name = "isActive")
    private Boolean isActive;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 20, nullable = false)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleId")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachmentId")
    private Attachment attachment;
}

