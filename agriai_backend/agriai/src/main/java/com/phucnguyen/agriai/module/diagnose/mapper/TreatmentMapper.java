package com.phucnguyen.agriai.module.diagnose.mapper;

import com.phucnguyen.agriai.module.diagnose.dto.TreatmentDTO;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import org.springframework.stereotype.Component;

@Component
public class TreatmentMapper {

    public TreatmentDTO toDTO(TreatmentPlan plan) {
        if (plan == null) {
            return null;
        }

        String generatedDosage = null;
        if (plan.getDosageValueMin() != null && plan.getDosageUnit() != null) {
            if (plan.getDosageValueMax() != null && plan.getDosageValueMax().compareTo(plan.getDosageValueMin()) > 0) {
                generatedDosage = plan.getDosageValueMin().stripTrailingZeros().toPlainString() + " - " + 
                                  plan.getDosageValueMax().stripTrailingZeros().toPlainString() + " " + plan.getDosageUnit();
            } else {
                generatedDosage = plan.getDosageValueMin().stripTrailingZeros().toPlainString() + " " + plan.getDosageUnit();
            }
            if (plan.getDosageType() != null) {
                switch(plan.getDosageType()) {
                    case PER_TANK: generatedDosage += "/bình"; break;
                    case PER_HA: generatedDosage += "/ha"; break;
                    case PER_AREA: generatedDosage += "/1000m²"; break;
                }
            }
        }

        String generatedWaterVolume = null;
        if (plan.getWaterVolumeMin() != null && plan.getWaterVolumeUnit() != null) {
            if (plan.getWaterVolumeMax() != null && plan.getWaterVolumeMax().compareTo(plan.getWaterVolumeMin()) > 0) {
                generatedWaterVolume = plan.getWaterVolumeMin().stripTrailingZeros().toPlainString() + " - " + 
                                       plan.getWaterVolumeMax().stripTrailingZeros().toPlainString() + " " + plan.getWaterVolumeUnit();
            } else {
                generatedWaterVolume = plan.getWaterVolumeMin().stripTrailingZeros().toPlainString() + " " + plan.getWaterVolumeUnit();
            }
            generatedWaterVolume += "/ha";
        }

        return TreatmentDTO.builder()
                .treatmentPlanId(plan.getId())
                .diseaseId(plan.getDisease() != null ? plan.getDisease().getId() : null)
                .diseaseName(plan.getDisease() != null ? plan.getDisease().getDiseaseName() : null)
                .diseaseNameEn(plan.getDisease() != null ? plan.getDisease().getDiseaseNameEn() : null)
                
                // Drug mapping
                .drugId(plan.getDrug() != null ? plan.getDrug().getId() : null)
                .drugName(plan.getDrug() != null ? plan.getDrug().getDrugName() : null)
                
                // UI display mapping
                .displayDosage(generatedDosage)
                .mixingInstruction(plan.getMixingInstruction())
                .displayWaterVolume(generatedWaterVolume)
                
                // Spray details
                .applicationMethod(plan.getApplicationMethod())
                .applicationTime(plan.getApplicationTime())
                .sprayTimes(plan.getSprayTimes())
                .sprayInterval(plan.getSprayInterval())
                .safetyNotes(plan.getSafetyNotes())
                .build();
    }
}
