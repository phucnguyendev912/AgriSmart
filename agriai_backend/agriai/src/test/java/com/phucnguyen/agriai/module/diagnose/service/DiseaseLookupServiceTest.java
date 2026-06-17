package com.phucnguyen.agriai.module.diagnose.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import com.phucnguyen.agriai.module.crop.entity.CropType;
import com.phucnguyen.agriai.module.diagnose.entity.Disease;
import com.phucnguyen.agriai.module.diagnose.repository.DiseaseRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiseaseLookupServiceTest {

    @Mock
    private DiseaseRepository diseaseRepository;

    private DiseaseLookupService service;
    private CropType cropType;

    @BeforeEach
    void setUp() {
        service = new DiseaseLookupService(diseaseRepository);
        cropType = CropType.builder().id(1).cropName("Lúa").build();
    }

    @Test
    void resolveExplicitDisease_prefersExactName() {
        Disease disease = Disease.builder().id(5).cropType(cropType).diseaseName("Đạo ôn").build();
        when(diseaseRepository.findByDiseaseNameIgnoreCaseAndIsDeleteFalse("Đạo ôn")).thenReturn(Optional.of(disease));
        when(diseaseRepository.findByDiseaseNameEnIgnoreCaseAndIsDeleteFalse("Đạo ôn")).thenReturn(Optional.empty());
        when(diseaseRepository.findByDiseaseCodeIgnoreCaseAndIsDeleteFalse("Đạo ôn")).thenReturn(Optional.empty());

        Optional<Disease> result = service.resolveExplicitDisease("Đạo ôn", cropType);

        assertTrue(result.isPresent());
        assertEquals(5, result.get().getId());
    }
}
