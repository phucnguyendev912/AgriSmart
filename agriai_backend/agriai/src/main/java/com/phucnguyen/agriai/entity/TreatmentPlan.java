package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

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

    // ⚠️ Giữ lại để hiển thị UI
    @Column(name = "dosage", length = 100)
    private String dosage;

    // ✅ THÊM MỚI - CHUẨN BACKEND
    @Column(name = "dosagePerHaValue", precision = 10, scale = 2)
    private BigDecimal dosagePerHaValue;

    @Column(name = "dosagePerHaUnit", length = 20)
    private String dosagePerHaUnit; // L, kg

    // ✅ THÊM - lượng nước (rất quan trọng)
    @Column(name = "waterVolumePerHa", length = 50)
    private String waterVolumePerHa; // ví dụ: 400-500 L/ha

    @Column(name = "applicationMethod", columnDefinition = "TEXT")
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