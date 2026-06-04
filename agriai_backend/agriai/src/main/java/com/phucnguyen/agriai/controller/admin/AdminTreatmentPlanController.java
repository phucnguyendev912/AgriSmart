package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateTreatmentPlanRequest;
import com.phucnguyen.agriai.dto.request.admin.AdminUpdateTreatmentPlanRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminTreatmentPlanResponse;
import com.phucnguyen.agriai.repository.DiseaseRepository;
import com.phucnguyen.agriai.repository.DrugRepository;
import com.phucnguyen.agriai.service.admin.AdminTreatmentPlanService;
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
public class AdminTreatmentPlanController {

    private final AdminTreatmentPlanService adminTreatmentPlanService;
    private final DiseaseRepository diseaseRepository;
    private final DrugRepository drugRepository;

    @GetMapping("/treatment-plans")
    public ResponseEntity<Page<AdminTreatmentPlanResponse>> getTreatmentPlans(
            @RequestParam(required = false) String treatmentName,
            @RequestParam(required = false) Integer cropTypeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminTreatmentPlanResponse> plans = adminTreatmentPlanService.getTreatmentPlans(treatmentName, cropTypeId,
                pageable);

        return ResponseEntity.ok(plans);
    }

    @GetMapping("/treatment-plans/stats")
    public ResponseEntity<Map<String, Object>> getTreatmentPlanStats() {
        return ResponseEntity.ok(adminTreatmentPlanService.getTreatmentPlanStats());
    }

    @GetMapping("/treatment-plans/{id}")
    public ResponseEntity<AdminTreatmentPlanResponse> getTreatmentPlanById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminTreatmentPlanService.getTreatmentPlanById(id));
    }

    @PostMapping("/treatment-plans")
    public ResponseEntity<AdminTreatmentPlanResponse> createTreatmentPlan(
            @Valid @RequestBody AdminCreateTreatmentPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminTreatmentPlanService.createTreatmentPlan(request));
    }

    @PutMapping("/treatment-plans/{id}")
    public ResponseEntity<AdminTreatmentPlanResponse> updateTreatmentPlan(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateTreatmentPlanRequest request) {
        return ResponseEntity.ok(adminTreatmentPlanService.updateTreatmentPlan(id, request));
    }

    @PatchMapping("/treatment-plans/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteTreatmentPlan(@PathVariable Integer id) {
        adminTreatmentPlanService.deleteTreatmentPlan(id);
        return ResponseEntity.ok(Map.of("message", "Xóa phác đồ điều trị thành công"));
    }

    @GetMapping("/treatment-plans/diseases/simple")
    public ResponseEntity<List<Map<String, Object>>> getSimpleDiseases() {
        List<Map<String, Object>> diseases = diseaseRepository.findAll().stream()
                .filter(d -> !d.getIsDelete())
                .map(d -> Map.of(
                        "id", (Object) d.getId(),
                        "name", (Object) d.getDiseaseName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(diseases);
    }

    // get drug simple for create treatment plan
    @GetMapping("/treatment-plans/drugs/simple")
    public ResponseEntity<List<Map<String, Object>>> getSimpleDrugs() {
        List<Map<String, Object>> drugs = drugRepository.findByIsActiveTrueAndIsDeleteFalse().stream()
                .map(d -> Map.of(
                        "id", (Object) d.getId(),
                        "name", (Object) d.getDrugName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(drugs);
    }
}
