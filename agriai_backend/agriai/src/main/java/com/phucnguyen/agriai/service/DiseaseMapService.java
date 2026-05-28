package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.MapMarkerResponse;
import com.phucnguyen.agriai.repository.DiseaseMapRepository;
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
