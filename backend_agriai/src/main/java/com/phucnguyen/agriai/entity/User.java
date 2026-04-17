package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "User")
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
    private String passwordHash;

    @Column(name = "isActive")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleId")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachmentId")
    private Attachment attachment;
}
