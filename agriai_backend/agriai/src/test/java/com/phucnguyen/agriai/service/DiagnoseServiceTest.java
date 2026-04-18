package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.InteractionWarningDTO;
import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.dto.TreatmentProgramDTO;
import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.dto.WeatherAlertDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.AIModel;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.entity.Disease;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.GuidancePort;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import com.phucnguyen.agriai.port.WeatherPort;
import com.phucnguyen.agriai.repository.DiagnoseHistoryDetailRepository;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiagnoseServiceTest {

        @Mock
        private DiagnoseHistoryRepository diagnoseHistoryRepository;
        @Mock
        private DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
        @Mock
        private DiagnosisValidationService diagnosisValidationService;
        @Mock
        private DiagnosisAttachmentService diagnosisAttachmentService;
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

        private DiagnoseService diagnoseService;
        private CropType cropType;
        private AIModel aiModel;
        private Disease disease1;
        private Disease disease2;

        @BeforeEach
        void setUp() {
                diagnoseService = new DiagnoseService(
                                diagnoseHistoryRepository,
                                diagnoseHistoryDetailRepository,
                                diagnosisValidationService,
                                diagnosisAttachmentService,
                                visionDetectionPort,
                                weatherPort,
                                ruleEngineService,
                                guidancePort,
                                diseaseMapper);

                cropType = CropType.builder().id(1).cropName("Lua").isActive(true).build();
                aiModel = AIModel.builder().id(10).modelFilePath("/models/rice.pt").isActive(true).build();
                disease1 = Disease.builder()
                                .id(100)
                                .diseaseCode("blast")
                                .diseaseName("Dao on")
                                .diseaseNameEn("Rice blast")
                                .severityLevel(SeverityLevel.NANG)
                                .build();
                disease2 = Disease.builder()
                                .id(101)
                                .diseaseCode("sheath_blight")
                                .diseaseName("Kho van")
                                .diseaseNameEn("Sheath blight")
                                .severityLevel(SeverityLevel.TRUNG_BINH)
                                .build();

                lenient().when(diagnoseHistoryRepository.save(any())).thenAnswer(invocation -> {
                        DiagnoseHistory history = invocation.getArgument(0);
                        if (history.getId() == null) {
                                history.setId(999);
                        }
                        return history;
                });
                lenient().when(diagnoseHistoryDetailRepository.save(any()))
                                .thenAnswer(invocation -> invocation.getArgument(0));
                lenient().when(guidancePort.generateGuidance(any())).thenReturn("Huong dan de hieu cho nong dan.");
        }

        @Test
        @DisplayName("TC1: Chan doan thanh cong voi 1 benh")
        void diagnose_singleDisease_success() {
                DiagnoseRequest request = createRequest(10.1, 106.2);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/1.jpg");

                VisionResultDTO blastResult = VisionResultDTO.builder().label("blast").confidence(0.92).severity("NANG")
                                .build();
                when(visionDetectionPort.detect(anyString(), anyString())).thenReturn(List.of(blastResult));
                when(weatherPort.getCurrentWeather(10.1, 106.2)).thenReturn(null);
                mockGrouping(List.of(blastResult));
                when(diseaseMapper.findDisease("blast")).thenReturn(Optional.of(disease1));
                when(ruleEngineService.process(anyList(), any())).thenReturn(singleDiseaseRuleEngineResult());

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertEquals("DISEASE_DETECTED", response.getDiagnosisType());
                assertEquals(1, response.getDiseases().size());
                assertEquals(1, response.getSprayPrograms().size());
                assertEquals("SINGLE_DISEASE_OR_SAFE_MIX", response.getSprayPrograms().get(0).getStrategy());
                verify(ruleEngineService).process(List.of(disease1.getId()), null);
        }

        @Test
        @DisplayName("TC2: Chan doan thanh cong voi nhieu benh")
        void diagnose_multipleDiseases_success() {
                DiagnoseRequest request = createRequest(10.1, 106.2);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/2.jpg");

                VisionResultDTO blast = VisionResultDTO.builder().label("blast").confidence(0.91).severity("NANG")
                                .build();
                VisionResultDTO sheathBlight = VisionResultDTO.builder().label("sheath_blight").confidence(0.85)
                                .build();
                when(visionDetectionPort.detect(anyString(), anyString())).thenReturn(List.of(blast, sheathBlight));
                when(weatherPort.getCurrentWeather(10.1, 106.2)).thenReturn(null);
                mockGrouping(List.of(blast, sheathBlight));
                when(diseaseMapper.findDisease("blast")).thenReturn(Optional.of(disease1));
                when(diseaseMapper.findDisease("sheath_blight")).thenReturn(Optional.of(disease2));
                when(ruleEngineService.process(anyList(), any())).thenReturn(multiDiseaseRuleEngineResult());

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertEquals(2, response.getDiseases().size());
                assertEquals(2, response.getSprayPrograms().size());
                assertEquals("SEPARATE_SPRAY", response.getSprayPrograms().get(0).getStrategy());
                assertEquals(1, response.getInteractionWarnings().size());
        }

        @Test
        @DisplayName("TC3: Vision AI tra ve cay khoe")
        void diagnose_healthyPlant() {
                DiagnoseRequest request = createRequest(null, null);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/3.jpg");
                when(visionDetectionPort.detect(anyString(), anyString()))
                                .thenReturn(List.of(
                                                VisionResultDTO.builder().label("healthy").confidence(0.99).build()));

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertTrue(response.getIsHealthy());
                assertEquals("HEALTHY", response.getDiagnosisType());
                assertTrue(response.getDiseases().isEmpty());
                verify(ruleEngineService, never()).process(anyList(), any());
        }

        @Test
        @DisplayName("TC4: Khong xac dinh duoc benh")
        void diagnose_unknownDisease() {
                DiagnoseRequest request = createRequest(null, null);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/4.jpg");

                VisionResultDTO lowConfidence = VisionResultDTO.builder().label("blast").confidence(0.10).build();
                when(visionDetectionPort.detect(anyString(), anyString())).thenReturn(List.of(lowConfidence));
                mockGrouping(List.of());

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertEquals("UNKNOWN", response.getDiagnosisType());
                assertTrue(response.getDiseases().isEmpty());
                verify(ruleEngineService, never()).process(anyList(), any());
        }

        @Test
        @DisplayName("TC5: Co GPS va lay duoc weather")
        void diagnose_withGps_weatherSuccess() {
                DiagnoseRequest request = createRequest(10.5, 106.7);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/5.jpg");
                when(visionDetectionPort.detect(anyString(), anyString())).thenReturn(List.of());
                mockGrouping(List.of());

                WeatherDTO weather = WeatherDTO.builder().temperature(28.0).humidity(85.0).rainfall(12.0).build();
                when(weatherPort.getCurrentWeather(10.5, 106.7)).thenReturn(weather);

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertNotNull(response.getWeather());
                assertTrue(response.getGpsUsed());
                assertEquals(28.0, response.getWeather().getTemperature());
        }

        @Test
        @DisplayName("TC6: Khong co GPS")
        void diagnose_withoutGps() {
                DiagnoseRequest request = createRequest(null, null);
                mockContext(request);
                when(diagnosisAttachmentService.uploadAndSave(any(), any())).thenReturn("https://img/6.jpg");
                when(visionDetectionPort.detect(anyString(), anyString())).thenReturn(List.of());
                mockGrouping(List.of());

                DiagnoseResponse response = diagnoseService.diagnose("farmer@agriai.vn", request);

                assertNull(response.getWeather());
                assertTrue(Boolean.FALSE.equals(response.getGpsUsed()));
                verify(weatherPort, never()).getCurrentWeather(any(), any());
        }

        private DiagnoseRequest createRequest(Double latitude, Double longitude) {
                DiagnoseRequest request = new DiagnoseRequest();
                request.setCropTypeId(1);
                request.setLatitude(latitude);
                request.setLongitude(longitude);
                request.setImage(new MockMultipartFile("image", "leaf.jpg", "image/jpeg", new byte[] { 1, 2, 3 }));
                return request;
        }

        private void mockContext(DiagnoseRequest request) {
                when(diagnosisValidationService.validate(anyString(), any())).thenReturn(
                                new DiagnosisValidationService.DiagnosisContext(null, cropType, aiModel));
        }

        private void mockGrouping(List<VisionResultDTO> results) {
                when(diseaseMapper.groupByMaxConfidence(anyList())).thenAnswer(invocation -> {
                        List<VisionResultDTO> input = invocation.getArgument(0);
                        Map<String, VisionResultDTO> grouped = new LinkedHashMap<>();
                        for (VisionResultDTO result : input) {
                                VisionResultDTO existing = grouped.get(result.getLabel());
                                if (existing == null || existing.getConfidence() < result.getConfidence()) {
                                        grouped.put(result.getLabel(), result);
                                }
                        }
                        return grouped;
                });
        }

        private RuleEngineService.RuleEngineResult singleDiseaseRuleEngineResult() {
                TreatmentDTO treatment = TreatmentDTO.builder()
                                .treatmentPlanId(11)
                                .diseaseId(disease1.getId())
                                .diseaseName(disease1.getDiseaseName())
                                .drugName("Filia 525SE")
                                .dosage("0.6L/ha")
                                .build();
                TreatmentProgramDTO program = TreatmentProgramDTO.builder()
                                .programOrder(1)
                                .programCode("SPRAY-1")
                                .strategy("SINGLE_DISEASE_OR_SAFE_MIX")
                                .mixAllowed(true)
                                .treatments(List.of(treatment))
                                .build();
                return new RuleEngineService.RuleEngineResult(
                                List.of(treatment),
                                List.of(),
                                List.of(program),
                                List.of(),
                                List.of(),
                                "SINGLE_DISEASE_OR_SAFE_MIX");
        }

        private RuleEngineService.RuleEngineResult multiDiseaseRuleEngineResult() {
                TreatmentDTO treatment1 = TreatmentDTO.builder()
                                .treatmentPlanId(11)
                                .diseaseId(disease1.getId())
                                .diseaseName(disease1.getDiseaseName())
                                .drugName("Filia 525SE")
                                .dosage("0.6L/ha")
                                .build();
                TreatmentDTO treatment2 = TreatmentDTO.builder()
                                .treatmentPlanId(12)
                                .diseaseId(disease2.getId())
                                .diseaseName(disease2.getDiseaseName())
                                .drugName("Validacin 3SL")
                                .dosage("1.0L/ha")
                                .build();
                InteractionWarningDTO interactionWarning = InteractionWarningDTO.builder()
                                .ingredientAId(1)
                                .ingredientAName("Tricyclazole")
                                .ingredientBId(2)
                                .ingredientBName("Validamycin")
                                .warningMessage("Khong duoc pha chung")
                                .actionRule("SEPARATE_SPRAY")
                                .blocksMixing(true)
                                .build();
                TreatmentProgramDTO program1 = TreatmentProgramDTO.builder()
                                .programOrder(1)
                                .programCode("SPRAY-1")
                                .strategy("SEPARATE_SPRAY")
                                .mixAllowed(false)
                                .treatments(List.of(treatment1))
                                .build();
                TreatmentProgramDTO program2 = TreatmentProgramDTO.builder()
                                .programOrder(2)
                                .programCode("SPRAY-2")
                                .strategy("SEPARATE_SPRAY")
                                .mixAllowed(false)
                                .treatments(List.of(treatment2))
                                .build();
                return new RuleEngineService.RuleEngineResult(
                                List.of(treatment1, treatment2),
                                List.of("Khong duoc pha chung"),
                                List.of(program1, program2),
                                List.of(interactionWarning),
                                List.of(),
                                "SEPARATE_SPRAY");
        }
}
