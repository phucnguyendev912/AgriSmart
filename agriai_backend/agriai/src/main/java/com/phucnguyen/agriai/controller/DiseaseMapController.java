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

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class DiseaseMapController {

    private final DiseaseMapService diseaseMapService;
    private final DiseaseRepository diseaseRepository;

    /**
     * GET /api/map/markers
     *
     * @param days      Số ngày lọc dữ liệu (mặc định 30)
     * @param diseaseId ID loại bệnh (tuỳ chọn)
     */
    @GetMapping("/markers")
    public ResponseEntity<List<MapMarkerResponse>> getMarkers(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(required = false) Integer diseaseId) {
        return ResponseEntity.ok(diseaseMapService.getMarkers(days, diseaseId));
    }

    @GetMapping("/diseases")
    public ResponseEntity<List<Map<String, Object>>> getDiseases() {
        return ResponseEntity.ok(diseaseRepository.findAll().stream()
                .map(d -> Map.of(
                        "id", (Object) d.getId(),
                        "diseaseName", (Object) d.getDiseaseName()))
                .collect(Collectors.toList()));
    }
}
