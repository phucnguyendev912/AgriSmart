package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.MapMarkerResponse;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import com.phucnguyen.agriai.service.DiseaseMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Controller for retrieving geographic disease distribution data for map visualization
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class DiseaseMapController {

    private final DiseaseMapService diseaseMapService;
    private final DiseaseRepository diseaseRepository;

    // Get location markers of diagnosed crop diseases within the specified last N days
    @GetMapping("/markers")
    public ResponseEntity<List<MapMarkerResponse>> getMarkers(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) Integer diseaseId) {
        return ResponseEntity.ok(diseaseMapService.getMarkers(days, diseaseId));
    }

    // Get simple key-value list of all diseases to populate selection filters in UI
    @GetMapping("/diseases")
    public ResponseEntity<List<Map<String, Object>>> getDiseases() {
        return ResponseEntity.ok(diseaseRepository.findAll().stream()
                .map(d -> Map.of(
                        "id", (Object) d.getId(),
                        "diseaseName", (Object) d.getDiseaseName()))
                .collect(Collectors.toList()));
    }
}
