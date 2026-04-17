package com.phucnguyen.agriai.port;

import com.phucnguyen.agriai.dto.WeatherDTO;

/**
 * Port interface for fetching real-time weather data.
 * Implementations: WeatherApiService (OpenWeatherMap).
 * Following D - Dependency Inversion Principle.
 */
public interface WeatherPort {
    WeatherDTO getCurrentWeather(Double latitude, Double longitude);
}
