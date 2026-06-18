package com.phucnguyen.agriai.module.crop.admin;

import com.phucnguyen.agriai.module.crop.dto.response.admin.AdminCropTypeResponse;
import com.phucnguyen.agriai.module.crop.entity.CropType;
import com.phucnguyen.agriai.module.crop.repository.CropTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminCropTypeService {

    private final CropTypeRepository cropTypeRepository;

    @Transactional(readOnly = true)
    public Page<AdminCropTypeResponse> getCropTypes(String cropName, Pageable pageable) {
        Page<CropType> cropTypes;
        if (cropName != null && !cropName.trim().isEmpty()) {
            cropTypes = cropTypeRepository.findByCropNameContainingIgnoreCaseAndIsDeleteFalse(cropName.trim(), pageable);
        } else {
            cropTypes = cropTypeRepository.findByIsDeleteFalse(pageable);
        }
        return cropTypes.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCropTypeStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalCropTypes = cropTypeRepository.countByIsDeleteFalse();
        stats.put("totalCropTypes", totalCropTypes);
        return stats;
    }

    private AdminCropTypeResponse mapToResponse(CropType cropType) {
        return AdminCropTypeResponse.builder()
                .id(cropType.getId())
                .cropName(cropType.getCropName())
                .description(cropType.getDescription())
                .createdAt(cropType.getCreatedAt())
                .updatedAt(cropType.getUpdatedAt())
                .build();
    }
}
