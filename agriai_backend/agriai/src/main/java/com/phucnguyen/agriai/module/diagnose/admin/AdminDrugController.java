package com.phucnguyen.agriai.module.diagnose.admin;

import com.phucnguyen.agriai.module.diagnose.dto.request.AdminCreateDrugRequest;
import com.phucnguyen.agriai.module.diagnose.dto.request.AdminUpdateDrugRequest;
import com.phucnguyen.agriai.module.diagnose.dto.response.AdminDrugResponse;

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

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDrugController {

    private final AdminDrugService adminDrugService;

    @GetMapping("/drugs")
    public ResponseEntity<Page<AdminDrugResponse>> getDrugs(
            @RequestParam(required = false) String drugName,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminDrugResponse> drugs = adminDrugService.getDrugs(drugName, manufacturer, isActive, pageable);
        return ResponseEntity.ok(drugs);
    }

    @GetMapping("/drugs/stats")
    public ResponseEntity<Map<String, Object>> getDrugStats() {
        return ResponseEntity.ok(adminDrugService.getDrugStats());
    }

    @GetMapping("/drugs/ingredients/simple")
    public ResponseEntity<List<Map<String, Object>>> getSimpleIngredients() {
        return ResponseEntity.ok(adminDrugService.getSimpleIngredients());
    }

    @GetMapping("/drugs/{id}")
    public ResponseEntity<AdminDrugResponse> getDrugById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminDrugService.getDrugById(id));
    }

    @PostMapping("/drugs")
    public ResponseEntity<AdminDrugResponse> createDrug(@Valid @RequestBody AdminCreateDrugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminDrugService.createDrug(request));
    }

    @PutMapping("/drugs/{id}")
    public ResponseEntity<AdminDrugResponse> updateDrug(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateDrugRequest request) {
        return ResponseEntity.ok(adminDrugService.updateDrug(id, request));
    }

    @PatchMapping("/drugs/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteDrug(@PathVariable Integer id) {
        adminDrugService.deleteDrug(id);
        return ResponseEntity.ok(Map.of("message", "Xóa thuốc thành công"));
    }
}
