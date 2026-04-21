package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.WeatherDTO;

public interface WeatherPort {
    WeatherDTO getCurrentWeather(Double latitude, Double longitude);
}
