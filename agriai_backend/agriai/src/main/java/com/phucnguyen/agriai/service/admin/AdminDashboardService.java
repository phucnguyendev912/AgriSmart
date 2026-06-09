package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.response.admin.AdminDashboardResponse;
import com.phucnguyen.agriai.dto.response.admin.AdminDashboardResponse.*;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseHistoryDetail;
import com.phucnguyen.agriai.entity.DiagnoseReview;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final DiagnoseHistoryRepository diagnoseHistoryRepository;
    private final DiagnoseHistoryDetailRepository diagnoseHistoryDetailRepository;
    private final DiagnoseReviewRepository diagnoseReviewRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Aggregates statistics, trends, distributions, top diseases, recent diagnoses, and reviews.
    public AdminDashboardResponse getDashboard(int periodDays) {
        if (periodDays < 1 || periodDays > 365) {
            throw new AppException(HttpStatus.BAD_REQUEST, "periodDays phải từ 1 đến 365");
        }

        LocalDateTime from = LocalDateTime.now().minusDays(periodDays);

        // Retrieve summary statistics.
        List<Object[]> userStatsRaw = userRepository.getUserStats();
        long totalUsers = 0;
        long activeUsers = 0;
        if (userStatsRaw != null && !userStatsRaw.isEmpty()) {
            Object[] row = userStatsRaw.get(0);
            totalUsers = ((Number) row[0]).longValue();
            activeUsers = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        }
        long totalDiagnoses = diagnoseHistoryDetailRepository.countTotalDiagnoses();
        long diagnosesInPeriod = diagnoseHistoryRepository.countInPeriod(from);
        long totalReviews = diagnoseReviewRepository.countTotalReviews();
        long accurateReviews = diagnoseReviewRepository.countAccurateReviews();
        double accuracyPercent = totalReviews > 0 ? (accurateReviews * 100.0 / totalReviews) : 0.0;
        Double avgRating = diagnoseReviewRepository.averageRating();
        Double avgConfidence = diagnoseHistoryDetailRepository.averageConfidence();

        Summary summary = Summary.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalDiagnoses(totalDiagnoses)
                .diagnosesInPeriod(diagnosesInPeriod)
                .totalReviews(totalReviews)
                .accuracyPercent(Math.round(accuracyPercent * 10.0) / 10.0)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .averageConfidence(avgConfidence != null ? Math.round(avgConfidence * 1000.0) / 10.0 : 0.0)
                .build();

        // Retrieve diagnosis count trend over the period.
        List<Object[]> trendRaw = diagnoseHistoryRepository.countByDateInPeriod(from);
        List<TrendItem> diagnosisTrend = trendRaw.stream()
                .map(row -> TrendItem.builder()
                        .date(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // Retrieve review accuracy trend over the period.
        List<Object[]> accRaw = diagnoseReviewRepository.accuracyTrendByDate(from);
        Map<String, AccuracyTrendItem.AccuracyTrendItemBuilder> accMap = new LinkedHashMap<>();
        for (Object[] row : accRaw) {
            String date = row[0].toString();
            boolean isAccurate = (Boolean) row[1];
            long count = ((Number) row[2]).longValue();
            accMap.computeIfAbsent(date, d -> AccuracyTrendItem.builder().date(d).accurate(0).inaccurate(0));
            AccuracyTrendItem.AccuracyTrendItemBuilder builder = accMap.get(date);
            if (isAccurate) builder.accurate(count);
            else builder.inaccurate(count);
        }
        List<AccuracyTrendItem> accuracyTrend = accMap.values().stream()
                .map(AccuracyTrendItem.AccuracyTrendItemBuilder::build)
                .collect(Collectors.toList());

        // Retrieve distribution of crop types in diagnostic history.
        List<Object[]> cropRaw = diagnoseHistoryRepository.countByCropType();
        List<CropDistributionItem> cropDistribution = cropRaw.stream()
                .map(row -> CropDistributionItem.builder()
                        .cropTypeName(row[0] != null ? row[0].toString() : "Không xác định")
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // Retrieve top 10 most common diseases.
        List<Object[]> diseaseRaw = diagnoseHistoryDetailRepository.countByDisease(PageRequest.of(0, 10));
        List<TopDiseaseItem> topDiseases = diseaseRaw.stream()
                .map(row -> TopDiseaseItem.builder()
                        .diseaseName(row[0] != null ? row[0].toString() : "Không xác định")
                        .count(((Number) row[1]).longValue())
                        .averageConfidence(row[2] != null ? Math.round(((Number) row[2]).doubleValue() * 1000.0) / 10.0 : 0.0)
                        .build())
                .collect(Collectors.toList());

        // Retrieve the 10 most recent diagnoses.
        List<DiagnoseHistory> latestHistories = diagnoseHistoryRepository.findLatest(PageRequest.of(0, 10));
        List<RecentDiagnosisItem> recentDiagnoses = latestHistories.stream()
                .map(h -> {
                    // Extract the primary disease name from the diagnosis details.
                    List<DiagnoseHistoryDetail> details = diagnoseHistoryDetailRepository
                            .findByDiagnoseHistoryIdAndIsDeleteFalse(h.getId());
                    String diseaseName = details.isEmpty() ? "" :
                            (details.get(0).getDisease() != null ? details.get(0).getDisease().getDiseaseName() : "");
                    double confidence = details.isEmpty() ? 0.0 :
                            (details.get(0).getConfidenceScore() != null ?
                                     details.get(0).getConfidenceScore().doubleValue() * 100 : 0.0);

                    return RecentDiagnosisItem.builder()
                            .id(h.getId())
                            .userName(h.getUser() != null ? h.getUser().getFullName() : "")
                            .cropTypeName(h.getCropType() != null ? h.getCropType().getCropName() : "")
                            .diseaseName(diseaseName)
                            .confidence(Math.round(confidence * 10.0) / 10.0)
                            .status(h.getStatus() != null ? h.getStatus().name() : "")
                            .createdAt(h.getCreatedAt() != null ? h.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                            .build();
                })
                .collect(Collectors.toList());

        // Retrieve the 10 most recent user feedback reviews.
        List<DiagnoseReview> latestReviewsList = diagnoseReviewRepository.findLatest(PageRequest.of(0, 10));
        List<LatestReviewItem> latestReviews = latestReviewsList.stream()
                .map(r -> LatestReviewItem.builder()
                        .id(r.getId())
                        .userName(r.getUser() != null ? r.getUser().getFullName() : "")
                        .accurate(Boolean.TRUE.equals(r.getAccurate()))
                        .rating(r.getRating())
                        .feedback(r.getFeedback() != null && r.getFeedback().length() > 100
                                ? r.getFeedback().substring(0, 100) + "..." : r.getFeedback())
                        .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "")
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .summary(summary)
                .diagnosisTrend(diagnosisTrend)
                .accuracyTrend(accuracyTrend)
                .cropDistribution(cropDistribution)
                .topDiseases(topDiseases)
                .recentDiagnoses(recentDiagnoses)
                .latestReviews(latestReviews)
                .build();
    }
}
