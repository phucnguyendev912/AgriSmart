package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateIngredientRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminIngredientResponse;
import com.phucnguyen.agriai.service.admin.AdminIngredientService;
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
public class AdminIngredientController {

    private final AdminIngredientService adminIngredientService;

    @GetMapping("/ingredients")
    public ResponseEntity<Page<AdminIngredientResponse>> getIngredients(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminIngredientService.getIngredients(name, pageable));
    }

    @GetMapping("/ingredients/stats")
    public ResponseEntity<Map<String, Object>> getIngredientStats() {
        return ResponseEntity.ok(adminIngredientService.getIngredientStats());
    }

    @GetMapping("/ingredients/{id}")
    public ResponseEntity<AdminIngredientResponse> getIngredientById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminIngredientService.getIngredientById(id));
    }

    @PostMapping("/ingredients")
    public ResponseEntity<AdminIngredientResponse> createIngredient(
            @Valid @RequestBody AdminCreateIngredientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminIngredientService.createIngredient(request));
    }

    @PutMapping("/ingredients/{id}")
    public ResponseEntity<AdminIngredientResponse> updateIngredient(
            @PathVariable Integer id,
            @Valid @RequestBody AdminCreateIngredientRequest request) {
        return ResponseEntity.ok(adminIngredientService.updateIngredient(id, request));
    }

    @PatchMapping("/ingredients/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteIngredient(@PathVariable Integer id) {
        adminIngredientService.deleteIngredient(id);
        return ResponseEntity.ok(Map.of("message", "Xóa hoạt chất thành công"));
    }
}
