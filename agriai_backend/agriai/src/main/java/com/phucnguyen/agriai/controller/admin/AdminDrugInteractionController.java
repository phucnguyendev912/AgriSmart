package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateDrugInteractionRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminDrugInteractionResponse;
import com.phucnguyen.agriai.service.admin.AdminDrugInteractionService;
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
public class AdminDrugInteractionController {

    private final AdminDrugInteractionService adminDrugInteractionService;

    @GetMapping("/drug-interactions")
    public ResponseEntity<Page<AdminDrugInteractionResponse>> getInteractions(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminDrugInteractionService.getInteractions(query, pageable));
    }

    @GetMapping("/drug-interactions/stats")
    public ResponseEntity<Map<String, Object>> getInteractionStats() {
        return ResponseEntity.ok(adminDrugInteractionService.getInteractionStats());
    }

    @GetMapping("/drug-interactions/{id}")
    public ResponseEntity<AdminDrugInteractionResponse> getInteractionById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminDrugInteractionService.getInteractionById(id));
    }

    @PostMapping("/drug-interactions")
    public ResponseEntity<AdminDrugInteractionResponse> createInteraction(
            @Valid @RequestBody AdminCreateDrugInteractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminDrugInteractionService.createInteraction(request));
    }

    @PutMapping("/drug-interactions/{id}")
    public ResponseEntity<AdminDrugInteractionResponse> updateInteraction(
            @PathVariable Integer id,
            @Valid @RequestBody AdminCreateDrugInteractionRequest request) {
        return ResponseEntity.ok(adminDrugInteractionService.updateInteraction(id, request));
    }

    @PatchMapping("/drug-interactions/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteInteraction(@PathVariable Integer id) {
        adminDrugInteractionService.deleteInteraction(id);
        return ResponseEntity.ok(Map.of("message", "Xóa tương tác thuốc thành công"));
    }
}
