package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "AImodel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AIModel extends BaseEntity {

    @Column(name = "modelName", length = 100)
    private String modelName;

    @Column(name = "modelVersion", length = 50)
    private String modelVersion;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "isActive")
    private Boolean isActive;
}
