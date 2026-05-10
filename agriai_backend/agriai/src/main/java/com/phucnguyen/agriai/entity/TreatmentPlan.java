package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import java.math.BigDecimal;

@Entity
@Table(name = "TreatmentPlan")
@Audited
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

    // ── LEGACY (giữ đến Phase 7) ─────────────────────────────────────────────
    /** @deprecated Sử dụng drug_id thay thế (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredientId")
    private Ingredient ingredient;

    /** @deprecated Sử dụng drug_id thay thế (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Column(name = "drugName", length = 100)
    private String drugName;

    /** @deprecated Sử dụng displayDosage hoặc dosageValueMin/Max (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Column(name = "dosage", length = 100)
    private String dosage;

    /** @deprecated Sử dụng dosageAreaValue (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Column(name = "dosagePerHaValue", precision = 10, scale = 2)
    private BigDecimal dosagePerHaValue;

    /** @deprecated Sử dụng dosageAreaUnit (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Column(name = "dosagePerHaUnit", length = 20)
    private String dosagePerHaUnit;

    /** @deprecated Sử dụng displayWaterVolume hoặc waterVolumeMin/Max (Drop ở Phase 7) */
    @Deprecated(since = "Phase 1.5", forRemoval = true)
    @Column(name = "waterVolumePerHa", length = 50)
    private String waterVolumePerHa;
    // ── END LEGACY ───────────────────────────────────────────────────────────

    // ── NEW: Drug FK ─────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drug_id")
    private Drug drug;

    // ── NEW: Chuẩn hoá liều lượng ────────────────────────────────────────────
    @Column(name = "dosage_type", length = 20)
    private String dosageType;           // PER_HA | PER_TANK | PER_AREA

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
    @Column(name = "display_dosage", length = 200)
    private String displayDosage;

    @Column(name = "mixing_instruction", columnDefinition = "TEXT")
    private String mixingInstruction;

    @Column(name = "display_water_volume", length = 100)
    private String displayWaterVolume;

    // ── NEW: Lịch phun ───────────────────────────────────────────────────────
    @Column(name = "water_volume_min", precision = 10, scale = 2)
    private BigDecimal waterVolumeMin;

    @Column(name = "water_volume_max", precision = 10, scale = 2)
    private BigDecimal waterVolumeMax;

    @Column(name = "water_volume_unit", length = 10)
    private String waterVolumeUnit;

    @Column(name = "spray_times")
    private Short sprayTimes;

    @Column(name = "spray_interval", length = 50)
    private String sprayInterval;

    // ── Fields giữ nguyên ────────────────────────────────────────────────────
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

    // ── NEW: Metadata ────────────────────────────────────────────────────────
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;
}