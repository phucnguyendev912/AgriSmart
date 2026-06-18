package com.phucnguyen.agriai.module.area.controller;

import com.phucnguyen.agriai.module.area.dto.request.AreaInforConfirmRequest;
import com.phucnguyen.agriai.module.area.dto.request.AreaInforRequest;
import com.phucnguyen.agriai.module.area.dto.response.AreaInforResponse;
import com.phucnguyen.agriai.module.area.service.AreaInforService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.security.Principal;

@RestController
@RequestMapping("/api/areas")
public class AreaInforController {

    private AreaInforService areaInforService;

    public AreaInforController(AreaInforService areaInforService) {
        this.areaInforService = areaInforService;
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Principal principal, @PathVariable Integer id) {
        areaInforService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

}
