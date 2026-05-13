package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.entity.Disease;

record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
}
