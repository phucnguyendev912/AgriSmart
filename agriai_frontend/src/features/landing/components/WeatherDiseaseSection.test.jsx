import { render, screen, waitFor } from '@testing-library/react';
import WeatherDiseaseSection from './WeatherDiseaseSection';
import { fetchWeatherDiseaseRisks } from '../../../services/weatherApi';

jest.mock('../../../services/weatherApi', () => ({
  fetchWeatherDiseaseRisks: jest.fn(),
  reverseGeocode: jest.fn(),
}));

describe('WeatherDiseaseSection', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchWeatherDiseaseRisks.mockReset();
  });

  test('loads weather risks from backend for saved province and renders rounded weather values', async () => {
    localStorage.setItem('agriai_selected_province_id', '32');
    fetchWeatherDiseaseRisks.mockResolvedValue({
      weather: {
        temperature: 25.6,
        humidity: 88.2,
        rainfall: 3.4,
      },
      diseaseWeatherRisks: [
        {
          diseaseId: 5,
          diseaseCode: 'BLAST',
          diseaseName: 'Dao on la',
          conditionGroup: 'BLAST_HIGH_1',
          recommendationNotes: 'Theo doi ruong sat hon',
        },
      ],
    });

    render(<WeatherDiseaseSection />);

    await waitFor(() => {
      expect(fetchWeatherDiseaseRisks).toHaveBeenCalledWith(10.5216, 105.1259);
    });

    expect(await screen.findByText('Dao on la')).toBeInTheDocument();
    expect(screen.getByText('Theo doi ruong sat hon')).toBeInTheDocument();
    expect(document.body).toHaveTextContent('26');
    expect(document.body).toHaveTextContent('88%');
    expect(document.body).toHaveTextContent('3mm');
    expect(document.body).not.toHaveTextContent('25.6');
    expect(document.body).not.toHaveTextContent('88.2');
    expect(document.body).not.toHaveTextContent('3.4');
  });

  test('shows empty state when backend returns no weather risks', async () => {
    localStorage.setItem('agriai_selected_province_id', '32');
    fetchWeatherDiseaseRisks.mockResolvedValue({
      weather: {
        temperature: 25,
        humidity: 70,
        rainfall: 0,
      },
      diseaseWeatherRisks: [],
    });

    render(<WeatherDiseaseSection />);

    await waitFor(() => {
      expect(fetchWeatherDiseaseRisks).toHaveBeenCalled();
    });

    expect(await screen.findByText(/Không có cảnh báo đáng kể/i)).toBeInTheDocument();
  });
});
