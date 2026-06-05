package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateWeatherConditionRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminWeatherConditionResponse;
import com.phucnguyen.agriai.service.admin.AdminWeatherConditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminWeatherConditionController {

    private final AdminWeatherConditionService adminWeatherConditionService;

    @GetMapping("/weather-conditions")
    public ResponseEntity<Page<AdminWeatherConditionResponse>> getConditions(
            @RequestParam(required = false) Integer diseaseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminWeatherConditionService.getConditions(diseaseId, pageable));
    }

    @GetMapping("/weather-conditions/stats")
    public ResponseEntity<Map<String, Object>> getConditionStats() {
        return ResponseEntity.ok(adminWeatherConditionService.getConditionStats());
    }

    @GetMapping("/weather-conditions/{id}")
    public ResponseEntity<AdminWeatherConditionResponse> getConditionById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminWeatherConditionService.getConditionById(id));
    }

    @PostMapping("/weather-conditions")
    public ResponseEntity<AdminWeatherConditionResponse> createCondition(
            @Valid @RequestBody AdminCreateWeatherConditionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminWeatherConditionService.createCondition(request));
    }

    @PutMapping("/weather-conditions/{id}")
    public ResponseEntity<AdminWeatherConditionResponse> updateCondition(
            @PathVariable Integer id,
            @Valid @RequestBody AdminCreateWeatherConditionRequest request) {
        return ResponseEntity.ok(adminWeatherConditionService.updateCondition(id, request));
    }

    @PatchMapping("/weather-conditions/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteCondition(@PathVariable Integer id) {
        adminWeatherConditionService.deleteCondition(id);
        return ResponseEntity.ok(Map.of("message", "Xóa điều kiện thời tiết thành công"));
    }
}
