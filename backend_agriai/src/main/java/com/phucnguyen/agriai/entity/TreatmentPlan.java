package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "TreatmentPlan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TreatmentPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diseaseId")
    private Disease disease;

    @Column(name = "planName", length = 100)
    private String planName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "steps", columnDefinition = "TEXT")
    private String steps;
}
