package com.phucnguyen.agriai.module.weather.enums;

import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;
import java.util.function.Function;

public enum WeatherFactor {

    TEMPERATURE("Nhiệt độ", WeatherDTO::getTemperature),
    HUMIDITY("Độ ẩm", WeatherDTO::getHumidity),
    RAINFALL("Lượng mưa", WeatherDTO::getRainfall);

    public final String displayName;
    private final Function<WeatherDTO, Double> extractor;

    WeatherFactor(String displayName, Function<WeatherDTO, Double> extractor) {
        this.displayName = displayName;
        this.extractor = extractor;
    }

    // Lấy giá trị thời tiết thực tế từ DTO
    public Double extract(WeatherDTO weather) {
        return weather != null ? extractor.apply(weather) : null;
    }
}
