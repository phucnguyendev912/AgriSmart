package com.phucnguyen.agriai.module.diagnose.mapper;
import com.phucnguyen.agriai.module.diagnose.repository.DiseaseRepository;

import com.phucnguyen.agriai.module.ai.dto.VisionResultDTO;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DiseaseMapper {

    private final DiseaseRepository diseaseRepository;

    public Optional<Disease> findDisease(String label, Integer cropTypeId) {
        String cleanLabel = label.trim();
        String underscoreLabel = cleanLabel.replace(" ", "_");
        String spaceLabel = cleanLabel.replace("_", " ");

        List<String> candidates = List.of(
                cleanLabel, underscoreLabel, spaceLabel);
            
        for (String candidate : candidates) {
            Optional<Disease> result = diseaseRepository.findByDiseaseCodeIgnoreCaseAndCropTypeIdAndIsDeleteFalse(candidate, cropTypeId);
            if (result.isPresent())
                return result;

            result = diseaseRepository.findByDiseaseNameEnIgnoreCaseAndCropTypeIdAndIsDeleteFalse(candidate, cropTypeId);
            if (result.isPresent())
                return result;

            result = diseaseRepository.findByDiseaseNameIgnoreCaseAndCropTypeIdAndIsDeleteFalse(candidate, cropTypeId);
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
