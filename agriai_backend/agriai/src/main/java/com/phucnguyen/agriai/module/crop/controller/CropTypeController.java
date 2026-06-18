package com.phucnguyen.agriai.module.crop.controller;

import com.phucnguyen.agriai.module.crop.dto.response.CropTypeResponse;
import com.phucnguyen.agriai.module.crop.service.CropTypeService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crop-types")
public class CropTypeController {

    private final CropTypeService cropTypeService;

    public CropTypeController(CropTypeService cropTypeService) {
        this.cropTypeService = cropTypeService;
    }

    @GetMapping
    public ResponseEntity<List<CropTypeResponse>> getAvailableCropTypes() {
        return ResponseEntity.ok(cropTypeService.getAvailableCropTypes());
    }
}
