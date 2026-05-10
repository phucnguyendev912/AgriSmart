package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.TreatmentDTO;
import com.phucnguyen.agriai.entity.TreatmentPlan;
import com.phucnguyen.agriai.enums.ScoringCriteria;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;

@Service
public class TreatmentRankingService {

    // Rank tất cả plans, trả về flat list với recommended + rank đã fill
    public List<TreatmentDTO> rankPlans(Map<Integer, List<TreatmentPlan>> plansByDisease) {
        return plansByDisease.values().stream()
                .filter(plans -> !plans.isEmpty())
                .flatMap(plans -> rankSingleDisease(plans).stream())
                .toList();
    }

    // Rank plans của 1 bệnh: sort theo score → plan top 1 là recommended
    private List<TreatmentDTO> rankSingleDisease(List<TreatmentPlan> plans) {
        record ScoredPlan(TreatmentPlan plan, int score) {}

        List<TreatmentPlan> sorted = plans.stream()
                .map(p -> new ScoredPlan(p, calculateScore(p)))
                .sorted(Comparator.comparingInt(ScoredPlan::score).reversed()
                        .thenComparingInt(sp -> sp.plan().getId()))
                .map(ScoredPlan::plan)
                .toList();

        return IntStream.range(0, sorted.size())
                .mapToObj(i -> {
                    TreatmentPlan plan = sorted.get(i);
                    TreatmentDTO dto = TreatmentDTO.fromEntity(plan);
                    dto.setRank(i + 1);
                    dto.setRecommended(i == 0);
                    dto.setRecommendationReason(i == 0 ? buildReason(plan) : null);
                    return dto;
                })
                .toList();
    }

    // Tổng điểm = cộng dồn từ ScoringCriteria enum
    private int calculateScore(TreatmentPlan plan) {
        return Arrays.stream(ScoringCriteria.values())
                .filter(c -> c.matches(plan))
                .mapToInt(c -> c.point)
                .sum();
    }

    // Gom lý do từ các tiêu chí match (chỉ lấy tiêu chí có reason)
    private String buildReason(TreatmentPlan plan) {
        String reasons = Arrays.stream(ScoringCriteria.values())
                .filter(c -> c.reason != null && c.matches(plan))
                .map(c -> c.reason)
                .collect(Collectors.joining(", "));

        return reasons.isBlank() ? "Phác đồ phù hợp nhất" : reasons;
    }
}
