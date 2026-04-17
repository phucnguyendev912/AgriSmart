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

    @Column(name = "treatmentName", length = 100)
    private String treatmentName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredientId")
    private Ingredient ingredient;

    @Column(name = "drugName", length = 100)
    private String drugName;

    @Column(name = "dosage", length = 100)
    private String dosage;

    @Column(name = "applicationMethod", length = 255)
    private String applicationMethod;

    @Column(name = "applicationTime", length = 100)
    private String applicationTime;

    @Column(name = "frequency", length = 100)
    private String frequency;

    @Column(name = "safetyNotes", columnDefinition = "TEXT")
    private String safetyNotes;

    @Column(name = "isRequired")
    private Boolean isRequired;
}
