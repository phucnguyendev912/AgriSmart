package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import com.phucnguyen.agriai.enums.DosageType;
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



    // ── NEW: Drug FK ─────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id")
    private Drug drug;

    // ── NEW: Chuẩn hoá liều lượng ────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_type", length = 20)
    private DosageType dosageType;           // PER_HA | PER_TANK | PER_AREA

    @Column(name = "dosage_value_min", precision = 10, scale = 4)
    private BigDecimal dosageValueMin;

    @Column(name = "dosage_value_max", precision = 10, scale = 4)
    private BigDecimal dosageValueMax;

    @Column(name = "dosage_unit", length = 20)
    private String dosageUnit;           // L, kg, g, ml

    @Column(name = "dosage_area_value", precision = 10, scale = 4)
    private BigDecimal dosageAreaValue;

    @Column(name = "dosage_area_unit", length = 20)
    private String dosageAreaUnit;       // ha, 1000m2

    // ── NEW: UI display ──────────────────────────────────────────────────────
    @Column(name = "mixing_instruction", columnDefinition = "TEXT")
    private String mixingInstruction;

    // ── NEW: Lịch phun ───────────────────────────────────────────────────────
    @Column(name = "water_volume_min", precision = 10, scale = 2)
    private BigDecimal waterVolumeMin;

    @Column(name = "water_volume_max", precision = 10, scale = 2)
    private BigDecimal waterVolumeMax;

    @Column(name = "water_volume_unit", length = 10)
    private String waterVolumeUnit;

    @Column(name = "spray_times")
    private Short sprayTimes;

    @Column(name = "spray_interval", length = 100)
    private String sprayInterval;

    // ── Fields giữ nguyên ────────────────────────────────────────────────────
    @Column(name = "applicationMethod", columnDefinition = "TEXT")
    private String applicationMethod;

    @Column(name = "applicationTime", length = 100)
    private String applicationTime;

    @Column(name = "safetyNotes", columnDefinition = "TEXT")
    private String safetyNotes;

    @Column(name = "isRequired")
    private Boolean isRequired;

    // ── NEW: Metadata ────────────────────────────────────────────────────────
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

}