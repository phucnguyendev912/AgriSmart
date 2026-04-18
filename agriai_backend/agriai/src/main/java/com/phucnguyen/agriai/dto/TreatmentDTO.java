package com.phucnguyen.agriai.dto;

import java.math.BigDecimal;
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
    private Integer treatmentPlanId;
    private Integer diseaseId;
    private String treatmentName;
    private String diseaseName;
    private Integer ingredientId;
    private String ingredientName;
    private String ingredientDescription;
    private String drugName;
    private List<String> activeIngredients;
    private String dosage;
    private BigDecimal dosagePerHaValue;
    private String dosagePerHaUnit;
    private String waterVolumePerHa;
    private String applicationMethod;
    private String applicationTime;
    private String frequency;
    private String safetyNotes;
    private String spraySchedule;
    private Boolean required;
    private Boolean weatherBlocked;
    private List<String> weatherWarnings;
}
