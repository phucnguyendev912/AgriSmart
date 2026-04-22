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

@Service
public class DiseaseMapper {

    @Autowired
    private DiseaseRepository diseaseRepository;

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
