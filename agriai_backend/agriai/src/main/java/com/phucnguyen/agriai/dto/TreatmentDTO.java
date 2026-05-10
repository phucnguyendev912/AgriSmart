package com.phucnguyen.agriai.dto;

import com.phucnguyen.agriai.entity.TreatmentPlan;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentDTO {
    // ── Thông tin cơ bản ─────────────────────────────────────────────────────
    private Integer treatmentPlanId;
    private Integer diseaseId;
    private String diseaseName;

    // ── Thông tin thuốc ──────────────────────────────────────────────────────
    private Integer drugId;
    private String drugName;

    // ── Xếp hạng phác đồ ─────────────────────────────────────────────────────
    private Boolean recommended;
    private Integer rank;
    private String recommendationReason;

    // ── Hướng dẫn hiển thị UI ────────────────────────────────────────────────
    private String displayDosage;
    private String mixingInstruction;
    private String displayWaterVolume;

    // ── Chi tiết phun xịt ────────────────────────────────────────────────────
    private String applicationMethod;
    private String applicationTime;
    private Short sprayTimes;
    private String sprayInterval;
    private String safetyNotes;

    // ── Legacy fields (Giữ tạm thời để Frontend không lỗi, sẽ bỏ sau) ────────
    @Deprecated
    private String treatmentName;
    @Deprecated
    private Integer ingredientId;
    @Deprecated
    private String ingredientName;
    @Deprecated
    private List<String> activeIngredients;
    @Deprecated
    private String dosage;
    @Deprecated
    private String waterVolumePerHa;
    @Deprecated
    private String frequency;
    @Deprecated
    private Boolean required;
    @Deprecated
    private Boolean weatherBlocked;
    @Deprecated
    private List<String> weatherWarnings;

    // ── Mapping Helper ───────────────────────────────────────────────────────
    public static TreatmentDTO fromEntity(TreatmentPlan plan) {
        if (plan == null)
            return null;

        return TreatmentDTO.builder()
                .treatmentPlanId(plan.getId())
                .diseaseId(plan.getDisease() != null ? plan.getDisease().getId() : null)
                .diseaseName(plan.getDisease() != null ? plan.getDisease().getDiseaseName() : null)

                // Drug mapping
                .drugId(plan.getDrug() != null ? plan.getDrug().getId() : null)
                .drugName(plan.getDrug() != null ? plan.getDrug().getDrugName() : plan.getDrugName())

                // UI display mapping (with legacy fallback)
                .displayDosage(plan.getDisplayDosage() != null ? plan.getDisplayDosage() : plan.getDosage())
                .mixingInstruction(plan.getMixingInstruction())
                .displayWaterVolume(plan.getDisplayWaterVolume() != null ? plan.getDisplayWaterVolume()
                        : plan.getWaterVolumePerHa())

                // Spray details (with legacy fallback)
                .applicationMethod(plan.getApplicationMethod())
                .applicationTime(plan.getApplicationTime())
                .sprayTimes(plan.getSprayTimes())
                .sprayInterval(plan.getSprayInterval() != null ? plan.getSprayInterval() : plan.getFrequency())
                .safetyNotes(plan.getSafetyNotes())

                // Legacy fields
                .treatmentName(plan.getTreatmentName())
                .ingredientId(plan.getIngredient() != null ? plan.getIngredient().getId() : null)
                .ingredientName(plan.getIngredient() != null ? plan.getIngredient().getIngredientName() : null)
                .dosage(plan.getDosage())
                .waterVolumePerHa(plan.getWaterVolumePerHa())
                .frequency(plan.getFrequency())
                .required(plan.getIsRequired())
                .build();
    }
}
