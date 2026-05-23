package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Service handling crop disease lookup and resolution by name or code
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DiseaseLookupService {

    private final DiseaseRepository diseaseRepository;

    // resolve explicit disease
    public Optional<Disease> resolveExplicitDisease(String diseaseName, CropType cropType) {
        if (diseaseName == null || diseaseName.isBlank()) {
            return Optional.empty();
        }
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
