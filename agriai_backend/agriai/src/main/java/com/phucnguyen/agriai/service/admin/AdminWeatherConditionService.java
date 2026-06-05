package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateWeatherConditionRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminWeatherConditionResponse;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.DiseaseWeatherCondition;
import com.phucnguyen.agriai.enums.Operator;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import com.phucnguyen.agriai.repository.DiseaseWeatherConditionRepository;
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
public class AdminWeatherConditionService {

    private final DiseaseWeatherConditionRepository conditionRepository;
    private final DiseaseRepository diseaseRepository;

    @Transactional(readOnly = true)
    public Page<AdminWeatherConditionResponse> getConditions(Integer diseaseId, Pageable pageable) {
        Page<DiseaseWeatherCondition> page;
        if (diseaseId != null) {
            page = conditionRepository.findByDiseaseIdNotDeleted(diseaseId, pageable);
        } else {
            page = conditionRepository.findAllNotDeleted(pageable);
        }
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminWeatherConditionResponse getConditionById(Integer id) {
        return mapToResponse(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConditionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalConditions", conditionRepository.countNotDeleted());
        stats.put("activeConditions", conditionRepository.countActiveNotDeleted());
        return stats;
    }

    @Transactional
    public AdminWeatherConditionResponse createCondition(AdminCreateWeatherConditionRequest request) {
        validateOperatorValues(request);

        Disease disease = getActiveDisease(request.getDiseaseId());

        DiseaseWeatherCondition condition = DiseaseWeatherCondition.builder()
                .disease(disease)
                .conditionGroup(request.getConditionGroup())
                .weatherFactor(request.getWeatherFactor())
                .operator(request.getOperator())
                .minValue(request.getMinValue())
                .maxValue(request.getMaxValue())
                .recommendationNote(request.getRecommendationNote())
                .unit(request.getUnit())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isDelete(false)
                .build();

        return mapToResponse(conditionRepository.save(condition));
    }

    @Transactional
    public AdminWeatherConditionResponse updateCondition(Integer id, AdminCreateWeatherConditionRequest request) {
        DiseaseWeatherCondition condition = getEntityById(id);
        validateOperatorValues(request);

        Disease disease = getActiveDisease(request.getDiseaseId());

        condition.setDisease(disease);
        condition.setConditionGroup(request.getConditionGroup());
        condition.setWeatherFactor(request.getWeatherFactor());
        condition.setOperator(request.getOperator());
        condition.setMinValue(request.getMinValue());
        condition.setMaxValue(request.getMaxValue());
        condition.setRecommendationNote(request.getRecommendationNote());
        condition.setUnit(request.getUnit());
        condition.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return mapToResponse(conditionRepository.save(condition));
    }

    @Transactional
    public void deleteCondition(Integer id) {
        DiseaseWeatherCondition condition = getEntityById(id);
        condition.setIsDelete(true);
        conditionRepository.save(condition);
    }

    private void validateOperatorValues(AdminCreateWeatherConditionRequest request) {
        if (request.getOperator() == Operator.BETWEEN) {
            if (request.getMinValue() == null || request.getMaxValue() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST,
                        "Toán tử BETWEEN yêu cầu cả giá trị tối thiểu và tối đa");
            }
        }
    }

    private Disease getActiveDisease(Integer diseaseId) {
        return diseaseRepository.findById(diseaseId)
                .filter(d -> !Boolean.TRUE.equals(d.getIsDelete()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy bệnh với ID: " + diseaseId));
    }

    private DiseaseWeatherCondition getEntityById(Integer id) {
        return conditionRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDelete()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy điều kiện thời tiết với ID: " + id));
    }

    private AdminWeatherConditionResponse mapToResponse(DiseaseWeatherCondition c) {
        return AdminWeatherConditionResponse.builder()
                .id(c.getId())
                .diseaseId(c.getDisease().getId())
                .diseaseName(c.getDisease().getDiseaseName())
                .conditionGroup(c.getConditionGroup())
                .weatherFactor(c.getWeatherFactor())
                .operator(c.getOperator())
                .minValue(c.getMinValue())
                .maxValue(c.getMaxValue())
                .unit(c.getUnit())
                .recommendationNote(c.getRecommendationNote())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
