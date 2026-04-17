package com.phucnguyen.agriai.dto;

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
    private String treatmentName;
    private String diseaseName;
    private String drugName;
    private List<String> activeIngredients;// 
    private String dosage;
    private String applicationMethod;
    private String applicationTime;
    private String frequency;
    private String safetyNotes;
    private String spraySchedule;
}
