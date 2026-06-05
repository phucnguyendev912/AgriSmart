package com.phucnguyen.agriai.dto.response.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.phucnguyen.agriai.enums.DosageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTreatmentPlanResponse {
    private Integer id;
    
    // Disease association details
    private Integer diseaseId;
    private String diseaseName;
    private String diseaseCode;
    private String cropTypeName;
    
    private String treatmentName;
    
    // Drug association details
    private Integer drugId;
    private String drugName;
    
    private DosageType dosageType;
    private BigDecimal dosageValueMin;
    private BigDecimal dosageValueMax;
    private String dosageUnit;
    
    private BigDecimal dosageAreaValue;
    private String dosageAreaUnit;
    
    private String mixingInstruction;
    
    private BigDecimal waterVolumeMin;
    private BigDecimal waterVolumeMax;
    private String waterVolumeUnit;
    
    private Short sprayTimes;
    private String sprayInterval;
    
    private String applicationMethod;
    private String applicationTime;
    
    private String safetyNotes;
    private String description;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
