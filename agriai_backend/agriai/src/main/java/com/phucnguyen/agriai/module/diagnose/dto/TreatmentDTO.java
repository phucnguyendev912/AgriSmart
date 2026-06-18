package com.phucnguyen.agriai.module.diagnose.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class TreatmentDTO {
    // ── Thông tin cơ bản ─────────────────────────────────────────────────────
    private Integer treatmentPlanId;
    private Integer diseaseId;
    private String diseaseName;
    private String diseaseNameEn;

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

}
