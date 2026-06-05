# Landing Weather Risk + Diagnosis Alert Layout

## Summary

- Landing section keeps the existing layout and changes only the data source.
- Backend exposes weather disease risks by comparing current weather with `disease_weather_condition`.
- Diagnosis result renders one weather-risk alert below disease cards.
- The separate `DiagnoseWeatherAlertsPanel` is removed from diagnosis result pages.

## Implementation Steps

1. Add backend API `GET /api/weather/disease-risks?latitude={lat}&longitude={lon}`.
2. Reuse `WeatherPort` for current weather and `DiseaseWeatherRiskEvaluator` for DB-backed risk matching.
3. Update landing `WeatherDiseaseSection` to call backend and map returned risks to the existing UI shape.
4. Update `DiagnoseResultPanel` to build the alert sentence from matching `diseaseWeatherRisks`.
5. Remove `DiagnoseWeatherAlertsPanel` imports and usage from diagnosis pages.

## Acceptance Criteria

- Landing keeps the old visual layout.
- Landing province selection calls backend with that province latitude and longitude.
- Matching DB weather conditions appear as disease risks on landing.
- Diagnosis weather-risk sentence is: `Thời tiết thuận lợi cho bệnh A, B phát triển. Hãy thăm đồng thường xuyên.`
- Legacy weather alerts are not rendered in diagnosis UI.
