package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.AreaInforRequest;
import com.phucnguyen.agriai.dto.response.AreaInforResponse;
import com.phucnguyen.agriai.service.AreaInforService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaInforController {

    @Autowired
    private AreaInforService areaInforService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<AreaInforResponse> create(@PathVariable Integer userId,
            @Valid @RequestBody AreaInforRequest request) {
        return ResponseEntity.ok(areaInforService.create(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AreaInforResponse>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(areaInforService.getByUser(userId));
    }
}
