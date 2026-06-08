package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.mapper.TreatmentMapper;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.DiagnoseReviewRepository;
import com.phucnguyen.agriai.repository.DiagnoseTreatmentRecommendationRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiagnoseHistoryServiceTest {

    @Mock
    private DiagnoseHistoryRepository diagnoseHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    @Mock
    private DiagnoseReviewRepository diagnoseReviewRepository;
    @Mock
    private DiagnoseTreatmentRecommendationRepository recommendationRepository;
    @Mock
    private TreatmentMapper treatmentMapper;

    private ObjectMapper objectMapper;
    private DiagnoseHistoryService service;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new DiagnoseHistoryService(
                diagnoseHistoryRepository,
                userRepository,
                diagnoseHistoryDetailRepository,
                diagnoseReviewRepository,
                recommendationRepository,
                treatmentMapper,
                objectMapper
        );
    }

    @Test
    void getDetail_success_returnsDiseaseNamesSeparately() {
        String email = "test@company.com";
        Integer id = 123;
        Integer userId = 1;

        User user = User.builder().id(userId).email(email).build();
        DiagnoseHistory history = DiagnoseHistory.builder()
                .id(id)
                .originalImageUrl("https://example.com/img.jpg")
                .weatherData(null)
                .build();

        Disease disease = Disease.builder()
                .id(1)
                .diseaseCode("BLAST")
                .diseaseName("Đạo ôn")
                .diseaseNameEn("Leaf Blast")
                .build();

        DiagnoseHistoryDetail detail = DiagnoseHistoryDetail.builder()
                .id(10)
                .disease(disease)
                .confidenceScore(BigDecimal.valueOf(0.92))
                .severity(com.phucnguyen.agriai.enums.SeverityLevel.NHE)
                .treatmentData(null)
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(diagnoseHistoryRepository.findByIdAndUserIdAndIsDeleteFalse(id, userId)).thenReturn(Optional.of(history));
        when(diagnoseHistoryDetailRepository.findByDiagnoseHistoryIdAndIsDeleteFalse(id)).thenReturn(List.of(detail));

        DiagnoseResponse response = service.getDetail(email, id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("https://example.com/img.jpg", response.getOriginalImageUrl());
        assertEquals(1, response.getDiseases().size());
        
        // Verify names are separate
        assertEquals("Đạo ôn", response.getDiseases().get(0).getDiseaseName());
        assertEquals("Leaf Blast", response.getDiseases().get(0).getDiseaseNameEn());
    }
}
