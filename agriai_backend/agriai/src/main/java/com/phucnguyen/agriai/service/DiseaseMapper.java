package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Responsible for mapping YOLO detection labels to Disease database records
 * and grouping detection results.
 * Following S - Single Responsibility Principle.
 */
@Service
public class DiseaseMapper {

    @Autowired
    private DiseaseRepository diseaseRepository;

    /**
     * Map YOLO label string to Disease entity using 3-tier fallback lookup:
     * diseaseCode → diseaseNameEn → diseaseName (all case-insensitive).
     */
    public Optional<Disease> findDisease(String label) {
        String cleanLabel = label.trim();
        String underscoreLabel = cleanLabel.replace(" ", "_");

        Optional<Disease> result = diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(cleanLabel);
        if (result.isEmpty()) {
            result = diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(underscoreLabel);
        }
        if (result.isEmpty()) {
            result = diseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(cleanLabel);
        }
        if (result.isEmpty()) {
            result = diseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(underscoreLabel);
        }
        if (result.isEmpty()) {
            result = diseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse(cleanLabel);
        }
        return result;
    }

    /**
     * Group detection results by label, keeping only the one with max confidence.
     */
    public Map<String, VisionResultDTO> groupByMaxConfidence(List<VisionResultDTO> results) {
        return results.stream()
                .collect(Collectors.toMap(
                        VisionResultDTO::getLabel,
                        vr -> vr,
                        (existing, replacement) -> existing.getConfidence() >= replacement.getConfidence()
                                ? existing
                                : replacement));
    }
}
