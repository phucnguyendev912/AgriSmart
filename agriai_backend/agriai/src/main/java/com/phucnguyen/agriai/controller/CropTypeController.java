package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.response.CropTypeResponse;
import com.phucnguyen.agriai.service.CropTypeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crop-types")
public class CropTypeController {

    @Autowired
    private CropTypeService cropTypeService;

    @GetMapping
    public ResponseEntity<List<CropTypeResponse>> getAvailableCropTypes() {
        return ResponseEntity.ok(cropTypeService.getAvailableCropTypes());
    }
}
