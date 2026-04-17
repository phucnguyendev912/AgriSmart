package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.SeverityLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "Disease")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Disease extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "croptypeId")
    private CropType cropType;

    @Column(name = "diseaseName", length = 50)
    private String diseaseName;

    @Column(name = "diseasenameEn", length = 50)
    private String diseaseNameEn;

    @Column(name = "diseaseCode", length = 50)
    private String diseaseCode;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "symptoms", length = 255)
    private String symptoms;

    @Enumerated(EnumType.STRING)
    @Column(name = "severityLevel")
    private SeverityLevel severityLevel;
}
