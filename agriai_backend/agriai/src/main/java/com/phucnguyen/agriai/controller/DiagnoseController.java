package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.service.DiagnoseService;
import jakarta.validation.Valid;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnoseController {

    @Autowired
    private DiagnoseService diagnoseService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiagnoseResponse> diagnose(
            Principal principal,
            @Valid @ModelAttribute DiagnoseRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(diagnoseService.diagnose(email, request));
    }
}
