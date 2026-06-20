package com.phucnguyen.agriai.module.diagnose.service;

import com.phucnguyen.agriai.module.crop.entity.CropType;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import com.phucnguyen.agriai.module.diagnose.repository.DiseaseRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DiseaseLookupService {

    private final DiseaseRepository diseaseRepository;

    // Giải quyết bệnh cụ thể
    public Optional<Disease> resolveExplicitDisease(String diseaseName, CropType cropType) {
        // Kiểm tra nếu diseaseName null hoặcisBlank thì return Optional.empty()
        if (diseaseName == null || diseaseName.isBlank()) {
            return Optional.empty();
        }
        // Tìm kiếm bệnh dựa trên diseaseName, diseaseNameEn, diseaseCode
        List<Optional<Disease>> matches = List.of(
                diseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse(diseaseName.trim()),
                diseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(diseaseName.trim()),
                diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(diseaseName.trim()));
        return matches.stream()
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(disease -> cropType == null || disease.getCropType() == null
                        || cropType.getId().equals(disease.getCropType().getId()))
                .findFirst();
    }

}
