package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateDiseaseRequest;
import com.phucnguyen.agriai.dto.request.admin.AdminUpdateDiseaseRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminDiseaseResponse;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import com.phucnguyen.agriai.service.admin.AdminDiseaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDiseaseController {

    private final AdminDiseaseService adminDiseaseService;
    private final CropTypeRepository cropTypeRepository;

    @GetMapping("/diseases")
    public ResponseEntity<Page<AdminDiseaseResponse>> getDiseases(
            @RequestParam(required = false) Integer cropTypeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminDiseaseResponse> diseases = adminDiseaseService.getDiseases(cropTypeId, pageable);
        
        return ResponseEntity.ok(diseases);
    }

    @GetMapping("/diseases/stats")
    public ResponseEntity<Map<String, Object>> getDiseaseStats() {
        return ResponseEntity.ok(adminDiseaseService.getDiseaseStats());
    }

    @GetMapping("/diseases/{id}")
    public ResponseEntity<AdminDiseaseResponse> getDiseaseById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminDiseaseService.getDiseaseById(id));
    }

    @PostMapping("/diseases")
    public ResponseEntity<AdminDiseaseResponse> createDisease(
            @Valid @RequestBody AdminCreateDiseaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminDiseaseService.createDisease(request));
    }

    @PutMapping("/diseases/{id}")
    public ResponseEntity<AdminDiseaseResponse> updateDisease(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateDiseaseRequest request) {
        return ResponseEntity.ok(adminDiseaseService.updateDisease(id, request));
    }

    @PatchMapping("/diseases/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteDisease(@PathVariable Integer id) {
        adminDiseaseService.deleteDisease(id);
        return ResponseEntity.ok(Map.of("message", "Xóa bệnh thành công"));
    }

    @GetMapping("/crop-types/simple")
    public ResponseEntity<List<Map<String, Object>>> getSimpleCropTypes() {
        List<Map<String, Object>> cropTypes = cropTypeRepository.findByIsActiveTrueAndIsDeleteFalse()
                .stream()
                .map(ct -> Map.of(
                        "id", (Object) ct.getId(),
                        "name", (Object) ct.getCropName()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(cropTypes);
    }
}
