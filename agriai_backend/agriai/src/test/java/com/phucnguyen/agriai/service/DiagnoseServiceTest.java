package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.mapper.DiseaseMapper;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.ImageStoragePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class DiagnoseServiceTest {

    @Mock
    private DiagnoseHistoryRepository diagnoseHistoryRepository;
    @Mock
    private DiagnosisValidationService diagnosisValidationService;
    @Mock
    private ImageStoragePort imageStoragePort;
    @Mock
    private VisionDetectionPort visionDetectionPort;
    @Mock
    private WeatherPort weatherPort;
    @Mock
    private RuleEngineService ruleEngineService;
    @Mock
    private GuidancePort guidancePort;
    @Mock
    private DiseaseMapper diseaseMapper;
    @Mock
    private DiagnoseHistoryPersistenceService historyPersistenceService;
    @Mock
    private GeocodingService geocodingService;

    private DiagnoseService diagnoseService;

    @BeforeEach
    void setUp() {
        diagnoseService = new DiagnoseService(
                diagnoseHistoryRepository,
                diagnosisValidationService,
                imageStoragePort,
                visionDetectionPort,
                weatherPort,
                ruleEngineService,
                guidancePort,
                diseaseMapper,
                new DiagnoseResponseBuilder(),
                historyPersistenceService,
                geocodingService);
    }

    @Test
    void diagnose_successWithMockedExternalServices_returnsDiseaseResult() {
        DiagnoseRequest request = validRequest();
        CropType cropType = CropType.builder().id(1).cropName("Rice").isActive(true).build();
        VisionResultDTO visionResult = VisionResultDTO.builder()
                .label("BLAST")
                .confidence(0.91)
                .build();
        Disease disease = Disease.builder()
                .id(7)
                .diseaseCode("BLAST")
                .diseaseName("Dao on")
                .diseaseNameEn("Leaf Blast")
                .build();
        WeatherDTO weather = WeatherDTO.builder()
                .temperature(29.0)
                .humidity(76.0)
                .rainfall(2.5)
                .build();

        when(diagnosisValidationService.validate(null, request))
                .thenReturn(new DiagnosisValidationService.DiagnosisContext(null, cropType));
        when(imageStoragePort.upload(request.getImage())).thenReturn("https://example.test/leaf.jpg");
        when(visionDetectionPort.detect("https://example.test/leaf.jpg")).thenReturn(List.of(visionResult));
        when(weatherPort.getCurrentWeather(10.5, 106.5)).thenReturn(weather);
        when(diseaseMapper.groupByMaxConfidence(anyList())).thenReturn(Map.of("BLAST", visionResult));
        when(diseaseMapper.findDisease("BLAST")).thenReturn(Optional.of(disease));
        when(ruleEngineService.process(anyList(), eq(weather))).thenReturn(emptyRuleResult());
        when(guidancePort.generateGuidance(any(DiagnoseResponse.class)))
                .thenReturn("Remove infected leaves and monitor the field.");

        DiagnoseResponse response = diagnoseService.diagnose(null, request);

        assertEquals("DISEASE_DETECTED", response.getDiagnosisType());
        assertEquals("https://example.test/leaf.jpg", response.getOriginalImageUrl());
        assertEquals(weather, response.getWeather());
        assertFalse(response.getDiseases().isEmpty());
        assertEquals("Leaf Blast (Dao on)", response.getDiseases().get(0).getDiseaseName());
        assertEquals("Remove infected leaves and monitor the field.", response.getUserGuidance());
        verifyNoInteractions(historyPersistenceService);
    }

    @Test
    void diagnose_externalUploadFails_returnsSystemError() {
        DiagnoseRequest request = validRequest();
        CropType cropType = CropType.builder().id(1).cropName("Rice").isActive(true).build();

        when(diagnosisValidationService.validate(null, request))
                .thenReturn(new DiagnosisValidationService.DiagnosisContext(null, cropType));
        when(imageStoragePort.upload(request.getImage())).thenThrow(new RuntimeException("Cloudinary down"));

        AppException exception = assertThrows(AppException.class, () -> diagnoseService.diagnose(null, request));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatus());
        assertNotNull(exception.getMessage());
        verify(imageStoragePort).upload(request.getImage());
    }

    private DiagnoseRequest validRequest() {
        DiagnoseRequest request = new DiagnoseRequest();
        request.setCropTypeId(1);
        request.setLatitude(10.5);
        request.setLongitude(106.5);
        request.setImage(new MockMultipartFile(
                "image",
                "leaf-test.jpg",
                "image/jpeg",
                new byte[] { 1, 2, 3 }));
        return request;
    }

    private RuleEngineService.RuleEngineResult emptyRuleResult() {
        return new RuleEngineService.RuleEngineResult(
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                false,
                null);
    }
}
