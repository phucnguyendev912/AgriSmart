package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.service.DiagnoseService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnoseController {

    @Autowired
    private DiagnoseService diagnoseService;

    /**
     * POST /api/diagnosis — Chẩn đoán bệnh (multipart form data)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiagnoseResponse> diagnose(
            Principal principal,
            @Valid @ModelAttribute DiagnoseRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseService.diagnose(email, request));
    }

    /**
     * GET /api/diagnosis/history — Lịch sử chẩn đoán của user
     */
    @GetMapping("/history")
    public ResponseEntity<List<DiagnoseResponse>> getHistory(Principal principal) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseService.getHistory(email));
    }

    /**
     * GET /api/diagnosis/{id} — Chi tiết 1 lần chẩn đoán
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiagnoseResponse> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(diagnoseService.getDetail(id));
    }
}
