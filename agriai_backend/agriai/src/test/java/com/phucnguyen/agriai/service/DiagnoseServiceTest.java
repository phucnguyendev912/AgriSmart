package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.entity.*;
import com.phucnguyen.agriai.enums.SeverityLevel;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiagnoseServiceTest {

        @InjectMocks
        private DiagnoseService diagnoseService;

        @Mock
        private UserRepository userRepository;
        @Mock
        private CropTypeRepository cropTypeRepository;
        @Mock
        private AIModelRepository aiModelRepository;
        @Mock
        private DiseaseRepository diseaseRepository;
        @Mock
        private DiagnoseHistoryRepository diagnoseHistoryRepository;
        @Mock
        private DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
        @Mock
        private AttachmentRepository attachmentRepository;

        @Mock
        private CloudinaryService cloudinaryService;
        @Mock
        private VisionAIService visionAIService;
        @Mock
        private WeatherApiService weatherApiService;
        @Mock
        private RuleEngineService ruleEngineService;
        @Mock
        private LLMService llmService;

        private CropType cropType;
        private AIModel aiModel;
        private Disease disease1;
        private Disease disease2;

        @BeforeEach
        void setUp() {
                cropType = new CropType();
                cropType.setId(1);
                cropType.setCropName("Lúa");
                cropType.setIsActive(true);
                cropType.setIsDelete(false);

                aiModel = new AIModel();
                aiModel.setId(1);
                aiModel.setModelName("YOLO-Rice");
                aiModel.setModelFilePath("/models/rice.pt");
                aiModel.setIsActive(true);
                aiModel.setIsDelete(false);

                disease1 = new Disease();
                disease1.setId(1);
                disease1.setDiseaseName("Bệnh Đạo Ôn");
                disease1.setDiseaseCode("blast");
                disease1.setSeverityLevel(SeverityLevel.NANG);
                disease1.setIsDelete(false);

                disease2 = new Disease();
                disease2.setId(2);
                disease2.setDiseaseName("Khô Vằn");
                disease2.setDiseaseCode("sheath_blight");
                disease2.setSeverityLevel(SeverityLevel.TRUNG_BINH);
                disease2.setIsDelete(false);
        }

        private DiagnoseRequest createRequest(MockMultipartFile file, Integer cropTypeId,
                        Double lat, Double lon) {
                DiagnoseRequest req = new DiagnoseRequest();
                req.setImage(file);
                req.setCropTypeId(cropTypeId);
                req.setLatitude(lat);
                req.setLongitude(lon);
                return req;
        }

        private MockMultipartFile validImage() {
                return new MockMultipartFile("image", "test.jpg", "image/jpeg", new byte[] { 1, 2, 3 });
        }

        private void setupCommonMocks() throws Exception {
                lenient().when(cropTypeRepository.findById(1)).thenReturn(Optional.of(cropType));
                lenient().when(aiModelRepository.findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(1))
                                .thenReturn(Optional.of(aiModel));
                lenient().when(aiModelRepository.findFirstByIsActiveTrueAndIsDeleteFalseOrderByIdAsc())
                                .thenReturn(Optional.of(aiModel));
                lenient().when(cloudinaryService.uploadImage(any())).thenReturn("https://cloudinary.com/test.jpg");
                lenient().when(llmService.generateGuidance(any())).thenReturn("Hướng dẫn chăm sóc.");
                when(diagnoseHistoryRepository.save(any())).thenAnswer(i -> {
                        DiagnoseHistory h = i.getArgument(0);
                        h.setId(100);
                        return h;
                });
                when(diagnoseHistoryDetailRepository.save(any())).thenAnswer(i -> i.getArgument(0));
                when(attachmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        }

        // ======================== TEST 1: 1 bệnh thành công ========================
        @Test
        @DisplayName("TC1: Chẩn đoán 1 bệnh thành công")
        void diagnose_singleDisease_success() throws Exception {
                setupCommonMocks();

                VisionResultDTO vr = VisionResultDTO.builder()
                                .label("blast").confidence(0.92).severity("NANG").build();
                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of(vr));
                when(weatherApiService.getCurrentWeather(any(), any())).thenReturn(null);
                when(diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse("blast"))
                                .thenReturn(Optional.of(disease1));
                when(ruleEngineService.process(anyList(), any()))
                                .thenReturn(new RuleEngineService.RuleEngineResult(List.of(), List.of()));

                DiagnoseRequest req = createRequest(validImage(), 1, null, null);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertNotNull(res);
                assertEquals(1, res.getDiseases().size());
                assertEquals("Bệnh Đạo Ôn", res.getDiseases().get(0).getDiseaseName());
                verify(diagnoseHistoryRepository).save(any());
        }

        // ======================== TEST 2: Nhiều bệnh thành công
        // ========================
        @Test
        @DisplayName("TC2: Chẩn đoán nhiều bệnh thành công")
        void diagnose_multipleDiseases_success() throws Exception {
                setupCommonMocks();

                VisionResultDTO vr1 = VisionResultDTO.builder()
                                .label("blast").confidence(0.90).severity("NANG").build();
                VisionResultDTO vr2 = VisionResultDTO.builder()
                                .label("sheath_blight").confidence(0.85).severity("TRUNG_BINH").build();
                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of(vr1, vr2));
                when(weatherApiService.getCurrentWeather(any(), any())).thenReturn(null);
                when(diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse("blast"))
                                .thenReturn(Optional.of(disease1));
                when(diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse("sheath_blight"))
                                .thenReturn(Optional.of(disease2));
                when(ruleEngineService.process(anyList(), any()))
                                .thenReturn(new RuleEngineService.RuleEngineResult(List.of(), List.of()));

                DiagnoseRequest req = createRequest(validImage(), 1, null, null);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertEquals(2, res.getDiseases().size());
        }

        // ======================== TEST 3: Cây khỏe (healthy) ========================
        @Test
        @DisplayName("TC3: Vision AI trả về cây khỏe")
        void diagnose_healthyPlant() throws Exception {
                setupCommonMocks();

                VisionResultDTO vr = VisionResultDTO.builder()
                                .label("healthy").confidence(0.98).build();
                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of(vr));
                when(weatherApiService.getCurrentWeather(any(), any())).thenReturn(null);

                DiagnoseRequest req = createRequest(validImage(), 1, null, null);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertNotNull(res);
                assertTrue(res.getDiseases().isEmpty());
                verify(diagnoseHistoryDetailRepository).save(any());
        }

        // ======================== TEST 4: Confidence thấp ========================
        @Test
        @DisplayName("TC4: Không xác định được bệnh (confidence dưới ngưỡng)")
        void diagnose_lowConfidence_noDisease() throws Exception {
                setupCommonMocks();

                VisionResultDTO vr = VisionResultDTO.builder()
                                .label("blast").confidence(0.10).build();
                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of(vr));
                when(weatherApiService.getCurrentWeather(any(), any())).thenReturn(null);

                DiagnoseRequest req = createRequest(validImage(), 1, null, null);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertTrue(res.getDiseases().isEmpty());
        }

        // ======================== TEST 5: GPS → weather ========================
        @Test
        @DisplayName("TC5: Có GPS - lấy weather thành công")
        void diagnose_withGPS_weatherSuccess() throws Exception {
                setupCommonMocks();

                WeatherDTO weather = WeatherDTO.builder()
                                .temperature(28.0).humidity(85.0).rainfall(12.0).build();
                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of());
                when(weatherApiService.getCurrentWeather(10.5, 106.7)).thenReturn(weather);

                DiagnoseRequest req = createRequest(validImage(), 1, 10.5, 106.7);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertNotNull(res.getWeather());
                assertEquals(28.0, res.getWeather().getTemperature());
                assertEquals(85.0, res.getWeather().getHumidity());
        }

        // ======================== TEST 6: Không GPS ========================
        @Test
        @DisplayName("TC6: Không có GPS - bỏ qua weather")
        void diagnose_noGPS_skipWeather() throws Exception {
                setupCommonMocks();

                when(visionAIService.detect(anyString(), anyString())).thenReturn(List.of());
                when(weatherApiService.getCurrentWeather(isNull(), isNull())).thenReturn(null);

                DiagnoseRequest req = createRequest(validImage(), 1, null, null);
                DiagnoseResponse res = diagnoseService.diagnose(null, req);

                assertNull(res.getWeather());
        }

        // ======================== TEST 9: Validate lỗi thiếu ảnh
        // ========================
        @Test
        @DisplayName("TC9: Validate lỗi khi thiếu ảnh")
        void diagnose_missingImage_throwsException() {
                DiagnoseRequest req = createRequest(null, 1, null, null);

                AppException ex = assertThrows(AppException.class,
                                () -> diagnoseService.diagnose(null, req));
                assertTrue(ex.getMessage().contains("Anh chan doan"));
        }

        // ======================== TEST 10: Validate lỗi thiếu cropTypeId
        // ========================
        @Test
        @DisplayName("TC10: Validate lỗi khi thiếu cropTypeId")
        void diagnose_missingCropTypeId_throwsException() {
                DiagnoseRequest req = createRequest(validImage(), null, null, null);

                AppException ex = assertThrows(AppException.class,
                                () -> diagnoseService.diagnose(null, req));
                assertTrue(ex.getMessage().contains("cropTypeId"));
        }
}
