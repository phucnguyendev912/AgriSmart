package com.phucnguyen.agriai.module.weather.port;

import com.phucnguyen.agriai.module.weather.dto.WeatherDTO;

public interface WeatherPort {
    WeatherDTO getCurrentWeather(Double latitude, Double longitude);
}
