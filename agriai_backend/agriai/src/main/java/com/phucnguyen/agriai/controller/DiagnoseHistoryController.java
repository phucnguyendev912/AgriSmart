package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.dto.response.DiagnoseHistoryResponse;
import com.phucnguyen.agriai.service.DiagnoseHistoryService;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diagnosis")
public class DiagnoseHistoryController {

    private final DiagnoseHistoryService diagnoseHistoryService;

    /**
     * GET /api/diagnosis/history — Lịch sử chẩn đoán của user
     */
    @GetMapping("/history")
    public ResponseEntity<Page<DiagnoseHistoryResponse>> getHistory(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String email = principal != null ? principal.getName() : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(diagnoseHistoryService.getHistory(email, pageable));
    }

    /**
     * GET /api/diagnosis/{id} — Chi tiết 1 lần chẩn đoán
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiagnoseResponse> getDetail(Principal principal, @PathVariable Integer id) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseHistoryService.getDetail(email, id));
    }
}
