package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DiseaseLookupService {

    private final DiseaseRepository diseaseRepository;

    public DiseaseLookupService(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    /** Tìm bệnh khớp chính xác theo diseaseName, diseaseNameEn hoặc diseaseCode. */
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

    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
