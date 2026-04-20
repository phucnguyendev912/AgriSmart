package com.phucnguyen.agriai.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.port.NominatimPort;
import com.phucnguyen.agriai.port.NominatimResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class NominatimAdapter implements NominatimPort {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&accept-language=vi";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public NominatimResult reverseGeocode(Double latitude, Double longitude) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "AgriAI/1.0 (agriAI@gmail.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    NOMINATIM_URL, HttpMethod.GET, entity, String.class, latitude, longitude);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("Nominatim trả về lỗi: {}", response.getStatusCode());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode address = root.path("address");

            List<String> addressParts = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> fields = address.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                String val = field.getValue().asText();
                if (key.equals("country") || key.equals("country_code") || key.equals("postcode") ||
                        key.equals("state") || key.equals("county") || key.equals("city") ||
                        key.equals("city_district") || key.equals("state_district") ||
                        key.equals("region") || key.equals("ISO3166-2-lvl4") || key.equals("municipality")) {
                    continue;
                }
                addressParts.add(val);
            }
            String shortAddress = String.join(", ", addressParts);

            return new NominatimResult(
                    root.path("display_name").asText(null),
                    shortAddress,
                    address.path("state").asText(null),
                    address.path("city").asText(null),
                    address.path("district").asText(null),
                    address.path("village").asText(null),
                    address.path("road").asText(null));

        } catch (Exception e) {
            log.error("Lỗi khi gọi Nominatim API: {}", e.getMessage());
            return null;
        }
    }
}
