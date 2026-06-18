package com.phucnguyen.agriai.module.diagnose.admin;

import com.phucnguyen.agriai.module.diagnose.dto.request.AdminCreateDrugRequest;
import com.phucnguyen.agriai.module.diagnose.dto.request.AdminUpdateDrugRequest;
import com.phucnguyen.agriai.module.diagnose.dto.response.AdminDrugResponse;
import com.phucnguyen.agriai.module.diagnose.entity.Drug;
import com.phucnguyen.agriai.module.diagnose.entity.DrugIngredient;
import com.phucnguyen.agriai.module.diagnose.entity.Ingredient;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.diagnose.repository.DrugRepository;
import com.phucnguyen.agriai.module.diagnose.repository.IngredientRepository;
import com.phucnguyen.agriai.module.diagnose.repository.TreatmentPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDrugService {

    private final DrugRepository drugRepository;
    private final IngredientRepository ingredientRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;

    @Transactional(readOnly = true)
    public Page<AdminDrugResponse> getDrugs(String drugName, String manufacturer, Boolean isActive, Pageable pageable) {
        String namePattern = (drugName != null && !drugName.trim().isEmpty())
                ? "%" + drugName.trim().toLowerCase() + "%"
                : null;
        String manufacturerPattern = (manufacturer != null && !manufacturer.trim().isEmpty())
                ? "%" + manufacturer.trim().toLowerCase() + "%"
                : null;

        Page<Drug> drugs = drugRepository.findAllByFilter(namePattern, manufacturerPattern, isActive, pageable);
        return drugs.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminDrugResponse getDrugById(Integer id) {
        Drug drug = getDrugEntityById(id);
        return mapToResponse(drug);
    }

    @Transactional
    public AdminDrugResponse createDrug(AdminCreateDrugRequest request) {
        Drug drug = Drug.builder()
                .drugName(request.getDrugName())
                .formulation(request.getFormulation())
                .manufacturer(request.getManufacturer())
                .isActive(request.getIsActive())
                .isDelete(false)
                .ingredients(new ArrayList<>())
                .build();

        if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
            List<DrugIngredient> drugIngredients = request.getIngredients().stream().map(reqIngredient -> {
                Ingredient ingredient = ingredientRepository.findById(reqIngredient.getIngredientId())
                        .filter(i -> !i.getIsDelete())
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hoạt chất với ID: " + reqIngredient.getIngredientId()));
                
                return DrugIngredient.builder()
                        .drug(drug)
                        .ingredient(ingredient)
                        .concentrationValue(reqIngredient.getConcentrationValue())
                        .concentrationUnit(reqIngredient.getConcentrationUnit())
                        .isDelete(false)
                        .build();
            }).collect(Collectors.toList());
            
            drug.getIngredients().addAll(drugIngredients);
        }

        Drug savedDrug = drugRepository.save(drug);
        return mapToResponse(savedDrug);
    }

    @Transactional
    public AdminDrugResponse updateDrug(Integer id, AdminUpdateDrugRequest request) {
        Drug drug = getDrugEntityById(id);

        drug.setDrugName(request.getDrugName());
        drug.setFormulation(request.getFormulation());
        drug.setManufacturer(request.getManufacturer());
        drug.setIsActive(request.getIsActive());

        drug.getIngredients().clear();

        if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
            List<DrugIngredient> drugIngredients = request.getIngredients().stream().map(reqIngredient -> {
                Ingredient ingredient = ingredientRepository.findById(reqIngredient.getIngredientId())
                        .filter(i -> !i.getIsDelete())
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy hoạt chất với ID: " + reqIngredient.getIngredientId()));
                
                return DrugIngredient.builder()
                        .drug(drug)
                        .ingredient(ingredient)
                        .concentrationValue(reqIngredient.getConcentrationValue())
                        .concentrationUnit(reqIngredient.getConcentrationUnit())
                        .isDelete(false)
                        .build();
            }).collect(Collectors.toList());
            
            drug.getIngredients().addAll(drugIngredients);
        }

        Drug updatedDrug = drugRepository.save(drug);
        return mapToResponse(updatedDrug);
    }

    @Transactional
    public void deleteDrug(Integer id) {
        Drug drug = getDrugEntityById(id);

        boolean isUsed = treatmentPlanRepository.existsByDrugIdAndIsDeleteFalse(id);
        if (isUsed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể xóa thuốc này vì đang được cấu hình sử dụng trong phác đồ điều trị");
        }

        drug.setIsDelete(true);
        drugRepository.save(drug);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDrugStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalDrugs = drugRepository.countByIsDeleteFalse();
        stats.put("totalDrugs", totalDrugs);
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSimpleIngredients() {
        return ingredientRepository.findAll().stream()
                .filter(i -> !i.getIsDelete())
                .map(i -> Map.of(
                        "id", (Object) i.getId(),
                        "name", (Object) i.getIngredientName()
                ))
                .collect(Collectors.toList());
    }

    private Drug getDrugEntityById(Integer id) {
        return drugRepository.findById(id)
                .filter(d -> !d.getIsDelete())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thuốc với ID: " + id));
    }

    private AdminDrugResponse mapToResponse(Drug drug) {
        List<AdminDrugResponse.DrugIngredientResponse> ingredientResponses = new ArrayList<>();
        if (drug.getIngredients() != null) {
            ingredientResponses = drug.getIngredients().stream()
                    .filter(di -> di.getIngredient() != null && !di.getIngredient().getIsDelete())
                    .map(di -> AdminDrugResponse.DrugIngredientResponse.builder()
                            .id(di.getId())
                            .ingredientId(di.getIngredient().getId())
                            .ingredientName(di.getIngredient().getIngredientName())
                            .concentrationValue(di.getConcentrationValue())
                            .concentrationUnit(di.getConcentrationUnit())
                            .rawConcentration(di.getRawConcentration())
                            .build())
                    .collect(Collectors.toList());
        }

        return AdminDrugResponse.builder()
                .id(drug.getId())
                .drugName(drug.getDrugName())
                .formulation(drug.getFormulation())
                .manufacturer(drug.getManufacturer())
                .isActive(drug.getIsActive())
                .ingredients(ingredientResponses)
                .createdAt(drug.getCreatedAt())
                .updatedAt(drug.getUpdatedAt())
                .build();
    }
}
