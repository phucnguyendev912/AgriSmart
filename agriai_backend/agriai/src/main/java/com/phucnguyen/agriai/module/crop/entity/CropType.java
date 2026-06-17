package com.phucnguyen.agriai.module.crop.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "CropType")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CropType extends BaseEntity {
    @Column(name = "cropName", length = 100)
    private String cropName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "isActive")
    private Boolean isActive;
}
