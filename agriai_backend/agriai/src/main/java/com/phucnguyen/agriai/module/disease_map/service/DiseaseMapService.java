package com.phucnguyen.agriai.module.disease_map.service;

import com.phucnguyen.agriai.module.disease_map.dto.MapMarkerResponse;
import com.phucnguyen.agriai.module.disease_map.repository.DiseaseMapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiseaseMapService {

    private final DiseaseMapRepository diseaseMapRepository;

    // get markers in N days
    public List<MapMarkerResponse> getMarkers(int days, Integer diseaseId) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return diseaseMapRepository.findMarkers(since, diseaseId);
    }
}
