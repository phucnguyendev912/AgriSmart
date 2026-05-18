package com.phucnguyen.agriai.dto.response.admin;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminDashboardResponse {

    private Summary summary;
    private List<TrendItem> diagnosisTrend;
    private List<AccuracyTrendItem> accuracyTrend;
    private List<CropDistributionItem> cropDistribution;
    private List<TopDiseaseItem> topDiseases;
    private List<RecentDiagnosisItem> recentDiagnoses;
    private List<LatestReviewItem> latestReviews;

    @Getter
    @Builder
    public static class Summary {
        private long totalUsers;
        private long activeUsers;
        private long totalDiagnoses;
        private long diagnosesInPeriod;
        private long totalReviews;
        private double accuracyPercent;
        private double averageRating;
        private double averageConfidence;
    }

    @Getter
    @Builder
    public static class TrendItem {
        private String date;
        private long count;
    }

    @Getter
    @Builder
    public static class AccuracyTrendItem {
        private String date;
        private long accurate;
        private long inaccurate;
    }

    @Getter
    @Builder
    public static class CropDistributionItem {
        private String cropTypeName;
        private long count;
    }

    @Getter
    @Builder
    public static class TopDiseaseItem {
        private String diseaseName;
        private long count;
        private double averageConfidence;
    }

    @Getter
    @Builder
    public static class RecentDiagnosisItem {
        private Integer id;
        private String userName;
        private String cropTypeName;
        private String diseaseName;
        private double confidence;
        private String status;
        private String createdAt;
    }

    @Getter
    @Builder
    public static class LatestReviewItem {
        private Integer id;
        private String userName;
        private boolean accurate;
        private Integer rating;
        private String feedback;
        private String createdAt;
    }
}
