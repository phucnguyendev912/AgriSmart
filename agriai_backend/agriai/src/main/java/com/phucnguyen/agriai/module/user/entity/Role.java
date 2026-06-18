package com.phucnguyen.agriai.module.user.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Role extends BaseEntity {
    @Column(name = "roleName", length = 50)
    private String roleName;

    @Column(name = "description", length = 255)
    private String description;
}
