package com.phucnguyen.agriai.module.crop.service;

import com.phucnguyen.agriai.module.crop.dto.response.CropTypeResponse;
import com.phucnguyen.agriai.module.crop.entity.CropType;
import com.phucnguyen.agriai.module.crop.repository.CropTypeRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class CropTypeService {

    private final CropTypeRepository cropTypeRepository;

    public CropTypeService(CropTypeRepository cropTypeRepository) {
        this.cropTypeRepository = cropTypeRepository;
    }

    // Get list of active and non-deleted crop types
    public List<CropTypeResponse> getAvailableCropTypes() {
        return cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Map CropType entity to response DTO
    private CropTypeResponse toResponse(CropType cropType) {
        return CropTypeResponse.builder()
                .id(cropType.getId())
                .cropName(cropType.getCropName())
                .description(cropType.getDescription())
                .build();
    }
}
