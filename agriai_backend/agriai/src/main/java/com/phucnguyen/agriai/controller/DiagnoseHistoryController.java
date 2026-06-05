package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.dto.response.DiagnoseHistoryResponse;
import com.phucnguyen.agriai.service.DiagnoseHistoryService;
import java.security.Principal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diagnosis")
public class DiagnoseHistoryController {

    private final DiagnoseHistoryService diagnoseHistoryService;

    @GetMapping("/history")
    public ResponseEntity<Page<DiagnoseHistoryResponse>> getHistory(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        String email = principal != null ? principal.getName() : null;
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(diagnoseHistoryService.getHistory(email, pageable, fromDate, toDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagnoseResponse> getDetail(Principal principal, @PathVariable Integer id) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseHistoryService.getDetail(email, id));
    }
}
