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
        String spaceLabel = cleanLabel.replace("_", " ");

        java.util.List<String> candidates = java.util.List.of(
                cleanLabel, underscoreLabel, spaceLabel);

        for (String candidate : candidates) {
            Optional<Disease> result = diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse(candidate);
            if (result.isPresent())
                return result;

            result = diseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse(candidate);
            if (result.isPresent())
                return result;

            result = diseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse(candidate);
            if (result.isPresent())
                return result;
        }

        return Optional.empty();
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
