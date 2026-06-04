package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.response.admin.AdminCropTypeResponse;
import com.phucnguyen.agriai.service.admin.AdminCropTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCropTypeController {

    private final AdminCropTypeService adminCropTypeService;

    @GetMapping("/crop-types")
    public ResponseEntity<Page<AdminCropTypeResponse>> getCropTypes(
            @RequestParam(required = false) String cropName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminCropTypeResponse> cropTypes = adminCropTypeService.getCropTypes(cropName, pageable);
        
        return ResponseEntity.ok(cropTypes);
    }

    @GetMapping("/crop-types/stats")
    public ResponseEntity<Map<String, Object>> getCropTypeStats() {
        return ResponseEntity.ok(adminCropTypeService.getCropTypeStats());
    }
}
