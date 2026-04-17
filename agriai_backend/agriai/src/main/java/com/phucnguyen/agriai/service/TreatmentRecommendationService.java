package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TreatmentRecommendationService {

    public List<TreatmentDTO> buildRecommendations(
            Integer cropTypeId,
            List<DiseaseResultDTO> diseases,
            WeatherDTO weather) {
        throw new UnsupportedOperationException("TODO: Truy van treatment plan va xu ly rule engine.");
    }

    public List<String> buildWarnings(
            List<DiseaseResultDTO> diseases,
            WeatherDTO weather,
            List<TreatmentDTO> treatments) {
        throw new UnsupportedOperationException("TODO: Ap dung treatment weather condition va drug interaction.");
    }
}
