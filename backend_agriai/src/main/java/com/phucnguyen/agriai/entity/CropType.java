package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
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
}
