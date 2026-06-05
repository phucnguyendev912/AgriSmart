import { render, screen } from '@testing-library/react';
import DiagnoseResultPanel from './DiagnoseResultPanel';

describe('DiagnoseResultPanel', () => {
    test('renders weather risk alert for matching diseases only and removes duplicates', () => {
        render(
            <DiagnoseResultPanel
                result={{
                    diseases: [
                        { diseaseId: 1, diseaseName: 'Dao on la', confidence: 0.92, severity: 'NANG' },
                        { diseaseId: 2, diseaseName: 'Kho van', confidence: 0.85, severity: 'TRUNG_BINH' },
                    ],
                    diseaseWeatherRisks: [
                        { diseaseId: 1, diseaseName: 'Dao on la' },
                        { diseaseId: 1, diseaseName: 'Dao on la' },
                        { diseaseId: 2, diseaseName: 'Kho van' },
                        { diseaseId: 99, diseaseName: 'Benh khac' },
                    ],
                    warnings: [],
                }}
            />
        );

        expect(screen.getByText('Dao on la')).toBeInTheDocument();
        expect(screen.getByText('Kho van')).toBeInTheDocument();
        expect(screen.getByText(/Nguy cơ cao: Bệnh có thể lây lan nhanh chóng/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Thời tiết thuận lợi cho bệnh Dao on la, Kho van phát triển\. Hãy thăm đồng thường xuyên\./i)
        ).toBeInTheDocument();
        expect(screen.queryByText(/Benh khac/)).not.toBeInTheDocument();
    });

    test('does not render weather risk alert when no risk matches detected diseases', () => {
        render(
            <DiagnoseResultPanel
                result={{
                    diseases: [
                        { diseaseId: 1, diseaseName: 'Dao on la', confidence: 0.92, severity: 'NANG' },
                    ],
                    diseaseWeatherRisks: [
                        { diseaseId: 99, diseaseName: 'Benh khac' },
                    ],
                    warnings: [],
                }}
            />
        );

        expect(screen.getByText('Dao on la')).toBeInTheDocument();
        expect(screen.queryByText(/Nguy cơ cao: Bệnh có thể lây lan nhanh chóng/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Thời tiết thuận lợi cho bệnh/i)).not.toBeInTheDocument();
    });
});
