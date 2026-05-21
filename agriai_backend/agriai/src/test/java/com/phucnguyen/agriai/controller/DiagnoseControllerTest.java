package com.phucnguyen.agriai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.DiseaseResultDTO;
import com.phucnguyen.agriai.dto.request.DiagnoseRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseResponse;
import com.phucnguyen.agriai.exception.GlobalExceptionHandler;
import com.phucnguyen.agriai.service.DiagnoseService;
import java.security.Principal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class DiagnoseControllerTest {

    @Mock
    private DiagnoseService diagnoseService;

    private MockMvc mockMvc;
    private final Principal principal = () -> "farmer@example.com";

    @BeforeEach
    void setUp() {
        DiagnoseController controller = new DiagnoseController();
        ReflectionTestUtils.setField(controller, "diagnoseService", diagnoseService);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void diagnose_validMultipart_returnsResult() throws Exception {
        DiagnoseResponse response = DiagnoseResponse.builder()
                .id(10)
                .diagnosisType("DISEASE_DETECTED")
                .diseases(List.of(DiseaseResultDTO.builder()
                        .diseaseId(7)
                        .diseaseName("Leaf Blast")
                        .confidence(0.91)
                        .build()))
                .build();

        when(diagnoseService.diagnose(eq("farmer@example.com"), any(DiagnoseRequest.class)))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/diagnosis")
                .file(validImage())
                .param("cropTypeId", "1")
                .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.diagnosisType").value("DISEASE_DETECTED"))
                .andExpect(jsonPath("$.diseases[0].diseaseName").value("Leaf Blast"));

        verify(diagnoseService).diagnose(eq("farmer@example.com"), any(DiagnoseRequest.class));
    }

    @Test
    void diagnose_missingImage_returnsBadRequest() throws Exception {
        mockMvc.perform(multipart("/api/diagnosis")
                .param("cropTypeId", "1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void diagnose_missingCropType_returnsBadRequest() throws Exception {
        mockMvc.perform(multipart("/api/diagnosis")
                .file(validImage()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    private MockMultipartFile validImage() {
        return new MockMultipartFile(
                "image",
                "leaf-test.jpg",
                "image/jpeg",
                new byte[] { 1, 2, 3 });
    }
}
