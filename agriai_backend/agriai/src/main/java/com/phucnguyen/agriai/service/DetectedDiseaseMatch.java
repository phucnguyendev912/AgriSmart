package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.entity.Disease;

/**
 * Kết quả khớp giữa một nhãn từ Vision API và một bệnh trong database.
 * Package-private để DiagnoseResponseBuilder và
 * DiagnoseHistoryPersistenceService có thể truy cập.
 */
record DetectedDiseaseMatch(Disease disease, VisionResultDTO visionResult) {
}
