# Diagnosis And Weather Section Tests

## Summary

- Add focused frontend unit tests for the diagnosis result panel.
- Add focused frontend unit tests for the landing weather disease section.
- Keep tests close to the changed UI behavior and avoid broad end-to-end scope.

## Test Cases

1. `DiagnoseResultPanel` renders one weather risk alert from matching `diseaseWeatherRisks`.
2. `DiagnoseResultPanel` ignores duplicate risks and risks for diseases not shown in `result.diseases`.
3. `DiagnoseResultPanel` does not render the weather risk alert when no matching risk exists.
4. `WeatherDiseaseSection` calls the backend weather risk API for the selected province.
5. `WeatherDiseaseSection` renders rounded weather values and disease risk data from backend response.

## Notes

- These are unit/component tests using Jest and React Testing Library.
- Backend service tests for weather risk matching already exist in `DiseaseWeatherRiskEvaluatorTest`.
