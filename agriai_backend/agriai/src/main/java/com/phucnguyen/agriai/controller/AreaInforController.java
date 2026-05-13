package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.AreaInforConfirmRequest;
import com.phucnguyen.agriai.dto.request.AreaInforRequest;
import com.phucnguyen.agriai.dto.response.AreaInforResponse;
import com.phucnguyen.agriai.service.AreaInforService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/areas")
public class AreaInforController {

    @Autowired
    private AreaInforService areaInforService;

    @PostMapping
    public ResponseEntity<AreaInforResponse> create(Principal principal,
            @Valid @RequestBody AreaInforRequest request) {
        return ResponseEntity.ok(areaInforService.create(principal.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<AreaInforResponse>> getByUser(Principal principal) {
        return ResponseEntity.ok(areaInforService.getByUser(principal.getName()));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<AreaInforResponse> confirm(
            Principal principal,
            @PathVariable Integer id,
            @RequestBody(required = false) AreaInforConfirmRequest request) {
        return ResponseEntity.ok(areaInforService.confirm(principal.getName(), id, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AreaInforResponse> update(
            Principal principal,
            @PathVariable Integer id,
            @Valid @RequestBody AreaInforRequest request) {
        return ResponseEntity.ok(areaInforService.update(principal.getName(), id, request));
    }
}
