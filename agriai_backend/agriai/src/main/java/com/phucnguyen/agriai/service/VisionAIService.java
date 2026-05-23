package com.phucnguyen.agriai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.VisionResultDTO;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.port.VisionDetectionPort;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

// Service implementation that sends crop images to an external Vision AI service for disease detection.
@Service
public class VisionAIService implements VisionDetectionPort {

    @Value("${vision.ai.url:http://localhost:8010/predict}")
    private String predictUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Downloads the image and sends it as multipart data to the Vision AI model, parsing the bounding box labels.
    @Override
    public List<VisionResultDTO> detect(String imageUrl) {
        try {
            byte[] imageBytes = downloadImage(imageUrl);

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
            ResponseEntity<String> response = restTemplate.exchange(
                    predictUrl, HttpMethod.POST, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Vision AI failed.");
            }

            JsonNode detections = new ObjectMapper()
                    .readTree(response.getBody())
                    .path("detections");
            if (!detections.isArray()) {
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Vision AI response is invalid.");
            }

            List<VisionResultDTO> results = new ArrayList<>();
            for (JsonNode detection : detections) {
                results.add(VisionResultDTO.builder()
                        .label(detection.path("class_name").asText())
                        .confidence(detection.path("confidence").asDouble(0.95))
                        .severity(null)
                        .build());
            }
            return results;
        } catch (AppException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Vision AI failed.");
        }
    }

    private byte[] downloadImage(String imageUrl) throws Exception {
        URL url = new URL(imageUrl);
        try (InputStream inputStream = url.openStream()) {
            return inputStream.readAllBytes();
        }
    }

    private HttpHeaders createFileHeaders() {
        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.IMAGE_JPEG);
        return fileHeaders;
    }
}
