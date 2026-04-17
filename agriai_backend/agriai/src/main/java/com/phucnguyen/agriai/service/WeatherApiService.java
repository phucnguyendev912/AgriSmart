package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.WeatherDTO;
import com.phucnguyen.agriai.port.WeatherPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherApiService implements WeatherPort {

    @Value("${weather.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public WeatherDTO getCurrentWeather(Double latitude, Double longitude) {
        if (latitude == null || longitude == null)
            return null;
        if (apiKey == null || apiKey.isBlank())
            return null;

        try {
            String url = String.format(
                    "https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric",
                    latitude, longitude, apiKey);
            // Gọi API
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null)
                return null;
            // Lấy dữ liệu
            @SuppressWarnings("unchecked")
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            Double temp = main != null ? toDouble(main.get("temp")) : null;
            Double humidity = main != null ? toDouble(main.get("humidity")) : null;
            // Lấy lượng mưa
            Double rainfall = 0.0;
            @SuppressWarnings("unchecked")
            Map<String, Object> rain = (Map<String, Object>) response.get("rain");
            if (rain != null && rain.get("1h") != null) {
                rainfall = toDouble(rain.get("1h"));
            }
            // Trả về kết quả
            return WeatherDTO.builder()
                    .temperature(temp)
                    .humidity(humidity)
                    .rainfall(rainfall)
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    // Chuyển đổi Object sang Double
    private Double toDouble(Object obj) {
        if (obj instanceof Number)
            return ((Number) obj).doubleValue();
        return null;
    }
}
