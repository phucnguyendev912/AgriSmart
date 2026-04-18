package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.response.CropTypeResponse;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CropTypeService {

    @Autowired
    private CropTypeRepository cropTypeRepository;

    public List<CropTypeResponse> getAvailableCropTypes() {
        return cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CropTypeResponse toResponse(CropType cropType) {
        return CropTypeResponse.builder()
                .id(cropType.getId())
                .cropName(cropType.getCropName())
                .description(cropType.getDescription())
                .build();
    }
}
