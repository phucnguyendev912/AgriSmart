package com.phucnguyen.agriai.service;

import java.util.List;

/**
 * Kết quả phân tích từ Vision API.
 * Package-private để DiagnoseResponseBuilder và
 * DiagnoseHistoryPersistenceService có thể truy cập.
 */
record DiagnosisAnalysis(
                boolean isHealthy,
                boolean isUnknown,
                List<DetectedDiseaseMatch> detectedDiseases) {
}
