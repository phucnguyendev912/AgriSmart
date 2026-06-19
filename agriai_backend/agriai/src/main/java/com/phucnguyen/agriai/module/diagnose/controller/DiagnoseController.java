package com.phucnguyen.agriai.module.diagnose.controller;

import com.phucnguyen.agriai.module.diagnose.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.module.diagnose.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.module.diagnose.service.DiagnoseService;
import jakarta.validation.Valid;
import java.security.Principal;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnoseController {

    private final DiagnoseService diagnoseService;

    public DiagnoseController(DiagnoseService diagnoseService) {
        this.diagnoseService = diagnoseService;
    }
    // 
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiagnoseResponse> diagnose(
            Principal principal,
            @Valid @ModelAttribute DiagnoseRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseService.diagnose(email, request));
    }
}
