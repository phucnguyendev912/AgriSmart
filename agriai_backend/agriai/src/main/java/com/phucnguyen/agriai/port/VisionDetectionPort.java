package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import java.util.List;

/**
 * Port interface for AI-based image disease detection.
 * Implementations: VisionAIService (YOLO local FastAPI).
 * Following D - Dependency Inversion Principle.
 */
public interface VisionDetectionPort {
    List<VisionResultDTO> detect(String imageUrl, String modelFilePath);
}
