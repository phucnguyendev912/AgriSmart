package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.entity.AIModel;
import com.phucnguyen.agriai.entity.CropType;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.AIModelRepository;
import com.phucnguyen.agriai.repository.CropTypeRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiagnosisValidationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private CropTypeRepository cropTypeRepository;
    @Mock
    private AIModelRepository aiModelRepository;

    private DiagnosisValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new DiagnosisValidationService(userRepository, cropTypeRepository, aiModelRepository);
    }

    @Test
    @DisplayName("TC9: Validate loi khi thieu anh")
    void validate_missingImage() {
        DiagnoseRequest request = new DiagnoseRequest();
        request.setCropTypeId(1);

        AppException exception = assertThrows(AppException.class, () -> validationService.validate(null, request));
        assertTrue(exception.getMessage().contains("Anh chan doan"));
    }

    @Test
    @DisplayName("TC10: Validate loi khi thieu cropTypeId")
    void validate_missingCropTypeId() {
        DiagnoseRequest request = new DiagnoseRequest();
        request.setImage(new MockMultipartFile("image", "leaf.jpg", "image/jpeg", new byte[] {1, 2, 3}));

        AppException exception = assertThrows(AppException.class, () -> validationService.validate(null, request));
        assertTrue(exception.getMessage().contains("cropTypeId"));
    }

    @Test
    @DisplayName("Validation pass voi cropType active va AI model active")
    void validate_success() {
        DiagnoseRequest request = new DiagnoseRequest();
        request.setCropTypeId(1);
        request.setImage(new MockMultipartFile("image", "leaf.jpg", "image/jpeg", new byte[] {1, 2, 3}));

        CropType cropType = CropType.builder().id(1).cropName("Lua").isActive(true).build();
        AIModel aiModel = AIModel.builder().id(5).isActive(true).modelFilePath("/models/rice.pt").build();

        when(cropTypeRepository.findById(1)).thenReturn(Optional.of(cropType));
        when(aiModelRepository.findFirstByCropTypeIdAndIsActiveTrueAndIsDeleteFalse(1)).thenReturn(Optional.of(aiModel));

        DiagnosisValidationService.DiagnosisContext context = validationService.validate(null, request);

        assertTrue(context.cropType().getId().equals(1));
        assertTrue(context.aiModel().getId().equals(5));
    }
}
