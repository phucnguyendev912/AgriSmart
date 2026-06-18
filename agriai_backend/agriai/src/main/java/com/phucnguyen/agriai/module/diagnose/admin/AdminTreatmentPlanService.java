package com.phucnguyen.agriai.module.diagnose.admin;

import com.phucnguyen.agriai.module.diagnose.dto.request.AdminCreateTreatmentPlanRequest;
import com.phucnguyen.agriai.module.diagnose.dto.request.AdminUpdateTreatmentPlanRequest;
import com.phucnguyen.agriai.module.diagnose.dto.response.AdminTreatmentPlanResponse;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import com.phucnguyen.agriai.module.diagnose.entity.Drug;
import com.phucnguyen.agriai.module.diagnose.entity.TreatmentPlan;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.diagnose.repository.DiseaseRepository;
import com.phucnguyen.agriai.module.diagnose.repository.DrugRepository;
import com.phucnguyen.agriai.module.diagnose.repository.TreatmentPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminTreatmentPlanService {

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final DiseaseRepository diseaseRepository;
    private final DrugRepository drugRepository;

    @Transactional(readOnly = true)
    public Page<AdminTreatmentPlanResponse> getTreatmentPlans(String treatmentName, Integer cropTypeId, Pageable pageable) {
        String searchPattern = (treatmentName != null && !treatmentName.trim().isEmpty()) 
                ? "%" + treatmentName.trim().toLowerCase() + "%" 
                : null;
        Page<TreatmentPlan> plans = treatmentPlanRepository.findAllByFilter(searchPattern, cropTypeId, pageable);
        return plans.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminTreatmentPlanResponse getTreatmentPlanById(Integer id) {
        TreatmentPlan plan = getTreatmentPlanEntityById(id);
        return mapToResponse(plan);
    }

    @Transactional
    public AdminTreatmentPlanResponse createTreatmentPlan(AdminCreateTreatmentPlanRequest request) {
        Disease disease = diseaseRepository.findById(request.getDiseaseId())
                .filter(d -> !d.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Bệnh cây trồng không tồn tại hoặc đã bị xóa"));

        Drug drug = null;
        if (request.getDrugId() != null) {
            drug = drugRepository.findById(request.getDrugId())
                    .filter(d -> !d.getIsDelete())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thuốc sử dụng không tồn tại hoặc đã bị xóa"));
        }

        TreatmentPlan plan = TreatmentPlan.builder()
                .disease(disease)
                .treatmentName(request.getTreatmentName())
                .drug(drug)
                .dosageType(request.getDosageType())
                .dosageValueMin(request.getDosageValueMin())
                .dosageValueMax(request.getDosageValueMax())
                .dosageUnit(request.getDosageUnit())
                .dosageAreaValue(request.getDosageAreaValue())
                .dosageAreaUnit(request.getDosageAreaUnit())
                .mixingInstruction(request.getMixingInstruction())
                .waterVolumeMin(request.getWaterVolumeMin())
                .waterVolumeMax(request.getWaterVolumeMax())
                .waterVolumeUnit(request.getWaterVolumeUnit())
                .sprayTimes(request.getSprayTimes())
                .sprayInterval(request.getSprayInterval())
                .applicationMethod(request.getApplicationMethod())
                .applicationTime(request.getApplicationTime())
                .safetyNotes(request.getSafetyNotes())
                .description(request.getDescription())
                .isDelete(false)
                .build();

        TreatmentPlan savedPlan = treatmentPlanRepository.save(plan);
        return mapToResponse(savedPlan);
    }

    @Transactional
    public AdminTreatmentPlanResponse updateTreatmentPlan(Integer id, AdminUpdateTreatmentPlanRequest request) {
        TreatmentPlan plan = getTreatmentPlanEntityById(id);

        Disease disease = diseaseRepository.findById(request.getDiseaseId())
                .filter(d -> !d.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Bệnh cây trồng không tồn tại hoặc đã bị xóa"));

        Drug drug = null;
        if (request.getDrugId() != null) {
            drug = drugRepository.findById(request.getDrugId())
                    .filter(d -> !d.getIsDelete())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Thuốc sử dụng không tồn tại hoặc đã bị xóa"));
        }

        plan.setDisease(disease);
        plan.setTreatmentName(request.getTreatmentName());
        plan.setDrug(drug);
        plan.setDosageType(request.getDosageType());
        plan.setDosageValueMin(request.getDosageValueMin());
        plan.setDosageValueMax(request.getDosageValueMax());
        plan.setDosageUnit(request.getDosageUnit());
        plan.setDosageAreaValue(request.getDosageAreaValue());
        plan.setDosageAreaUnit(request.getDosageAreaUnit());
        plan.setMixingInstruction(request.getMixingInstruction());
        plan.setWaterVolumeMin(request.getWaterVolumeMin());
        plan.setWaterVolumeMax(request.getWaterVolumeMax());
        plan.setWaterVolumeUnit(request.getWaterVolumeUnit());
        plan.setSprayTimes(request.getSprayTimes());
        plan.setSprayInterval(request.getSprayInterval());
        plan.setApplicationMethod(request.getApplicationMethod());
        plan.setApplicationTime(request.getApplicationTime());
        plan.setSafetyNotes(request.getSafetyNotes());
        plan.setDescription(request.getDescription());

        TreatmentPlan updatedPlan = treatmentPlanRepository.save(plan);
        return mapToResponse(updatedPlan);
    }

    @Transactional
    public void deleteTreatmentPlan(Integer id) {
        TreatmentPlan plan = getTreatmentPlanEntityById(id);
        plan.setIsDelete(true);
        treatmentPlanRepository.save(plan);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTreatmentPlanStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalTreatmentPlans = treatmentPlanRepository.countByIsDeleteFalse();
        stats.put("totalTreatmentPlans", totalTreatmentPlans);
        return stats;
    }

    private TreatmentPlan getTreatmentPlanEntityById(Integer id) {
        return treatmentPlanRepository.findById(id)
                .filter(tp -> !tp.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phác đồ điều trị với ID: " + id));
    }

    private AdminTreatmentPlanResponse mapToResponse(TreatmentPlan tp) {
        return AdminTreatmentPlanResponse.builder()
                .id(tp.getId())
                .diseaseId(tp.getDisease() != null ? tp.getDisease().getId() : null)
                .diseaseName(tp.getDisease() != null ? tp.getDisease().getDiseaseName() : null)
                .diseaseCode(tp.getDisease() != null ? tp.getDisease().getDiseaseCode() : null)
                .cropTypeName((tp.getDisease() != null && tp.getDisease().getCropType() != null) ? tp.getDisease().getCropType().getCropName() : null)
                .treatmentName(tp.getTreatmentName())
                .drugId(tp.getDrug() != null ? tp.getDrug().getId() : null)
                .drugName(tp.getDrug() != null ? tp.getDrug().getDrugName() : null)
                .dosageType(tp.getDosageType())
                .dosageValueMin(tp.getDosageValueMin())
                .dosageValueMax(tp.getDosageValueMax())
                .dosageUnit(tp.getDosageUnit())
                .dosageAreaValue(tp.getDosageAreaValue())
                .dosageAreaUnit(tp.getDosageAreaUnit())
                .mixingInstruction(tp.getMixingInstruction())
                .waterVolumeMin(tp.getWaterVolumeMin())
                .waterVolumeMax(tp.getWaterVolumeMax())
                .waterVolumeUnit(tp.getWaterVolumeUnit())
                .sprayTimes(tp.getSprayTimes())
                .sprayInterval(tp.getSprayInterval())
                .applicationMethod(tp.getApplicationMethod())
                .applicationTime(tp.getApplicationTime())
                .safetyNotes(tp.getSafetyNotes())
                .description(tp.getDescription())
                .createdAt(tp.getCreatedAt())
                .updatedAt(tp.getUpdatedAt())
                .build();
    }
}
