package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.util.List;

/**
 * Service gọi local YOLO API (FastAPI) để nhận diện bệnh lá lúa.
 * Endpoint: POST http://localhost:8000/predict
 * Request: multipart/form-data { image: file }
 * Response: "Disease Name" (JSON string)
 */
@Service
public class VisionAIService implements VisionDetectionPort {

    @Value("${vision.ai.url:http://localhost:8010/predict}")
    private String predictUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Download ảnh từ Cloudinary URL, gửi tới YOLO API, trả về kết quả.
     *
     * @param imageUrl      URL ảnh đã upload lên Cloudinary
     * @param modelFilePath Đường dẫn model AI (không dùng vì model đã load sẵn trên
     *                      FastAPI)
     * @return Danh sách kết quả nhận diện (1 kết quả cho classification)
     */
    public List<VisionResultDTO> detect(String imageUrl, String modelFilePath) {
        try {
            // 1. Download ảnh từ Cloudinary URL
            byte[] imageBytes = downloadImage(imageUrl);

            // 2. Build multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource imageResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return "image.jpg";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new HttpEntity<>(imageResource, createFileHeaders()));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Gọi YOLO API
            ResponseEntity<String> response = restTemplate.exchange(
                    predictUrl, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                JsonNode detections = root.path("detections");

                List<VisionResultDTO> results = new java.util.ArrayList<>();
                if (detections.isArray()) {
                    for (JsonNode det : detections) {
                        String label = det.path("class_name").asText();
                        double confidence = det.path("confidence").asDouble(0.95);

                        VisionResultDTO result = VisionResultDTO.builder()
                                .label(label)
                                .confidence(confidence)
                                .severity(null)
                                .build();
                        results.add(result);
                    }
                }
                return results;
            }

            return List.of();
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Lỗi khi gọi Vision AI: " + e.getMessage());
            // Nếu YOLO API không khả dụng, trả danh sách rỗng
            return List.of();
        }
    }

    private byte[] downloadImage(String imageUrl) throws Exception {
        URL url = new URL(imageUrl);
        try (InputStream is = url.openStream()) {
            return is.readAllBytes();
        }
    }

    // Tạo headers cho file
    private HttpHeaders createFileHeaders() {
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.IMAGE_JPEG);
        return fileHeaders;
    }
}
