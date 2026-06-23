package com.phucnguyen.agriai.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.module.area.port.NominatimPort;
import com.phucnguyen.agriai.module.area.port.NominatimResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

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

            // Task 1.1 & 1.2: Chọn có chủ ý các fields đường phố, bỏ các cấp hành chính lớn
            // Nominatim VN dùng "city" = phường/xã nên KHÔNG đưa vào shortAddress
            String[] streetFields = { "house_number", "road", "quarter", "suburb", "neighbourhood" };
            List<String> addressParts = new ArrayList<>();
            for (String field : streetFields) {
                String val = address.path(field).asText(null);
                if (val != null && !val.isBlank()) {
                    addressParts.add(val);
                }
            }
            // Task 1.3: Join bằng ", "
            String shortAddress = String.join(", ", addressParts);

            // Task 2.1 & 2.3: Parse province từ display_name thay vì dùng address.city/state
            // Nominatim VN không có field "state", và "city" trả về tên phường/xã (sai cấp)
            // display_name luôn có dạng: "..., <tên tỉnh>, <postcode>, Việt Nam"
            String province = parseProvinceFromDisplayName(root.path("display_name").asText(null));

            return new NominatimResult(
                    root.path("display_name").asText(null),
                    shortAddress,
                    province,
                    address.path("city").asText(null),
                    address.path("district").asText(null),
                    address.path("village").asText(null),
                    address.path("road").asText(null));

        } catch (Exception e) {
            log.error("Lỗi khi gọi Nominatim API: {}", e.getMessage());
            return null;
        }
    }

    // Task 2.1 & 2.2: Tách tên tỉnh/thành phố từ display_name
    // display_name có dạng: "..., <tên tỉnh>, [postcode,] Việt Nam"
    // Postcode có thể vắng mặt (vùng nông thôn), nên không thể hardcode vị trí từ cuối.
    // Giải pháp: loại bỏ "Việt Nam" và postcode (nếu có) từ cuối, lấy phần tử cuối cùng còn lại.
    private String parseProvinceFromDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            // Task 2.2: log warning khi không parse được
            log.warn("Nominatim: display_name is null or blank, cannot extract province");
            return null;
        }
        String[] parts = displayName.split(", ");
        if (parts.length < 2) {
            log.warn("Nominatim: display_name '{}' quá ngắn để parse province", displayName);
            return null;
        }
        // Duyệt từ cuối, bỏ qua "Việt Nam" và chuỗi toàn số (postcode)
        int idx = parts.length - 1;
        while (idx >= 0) {
            String part = parts[idx].trim();
            if (part.equalsIgnoreCase("Việt Nam") || part.matches("\\d+")) {
                idx--;
            } else {
                break;
            }
        }
        if (idx < 0) {
            log.warn("Nominatim: không tìm được province trong display_name '{}'", displayName);
            return null;
        }
        return stripProvincePrefixes(parts[idx].trim());
    }

    // Bỏ tiền tố hành chính để chỉ giữ lại tên thuần: "Thành phố Huế" → "Huế"
    private String stripProvincePrefixes(String province) {
        if (province == null) return null;
        String[] prefixes = { "Thành phố ", "Thành Phố ", "Tỉnh " };
        for (String prefix : prefixes) {
            if (province.startsWith(prefix)) {
                return province.substring(prefix.length()).trim();
            }
        }
        return province;
    }
}
