package com.phucnguyen.agriai.module.diagnose.admin;

import com.phucnguyen.agriai.module.diagnose.dto.response.AdminReviewResponse;
import com.phucnguyen.agriai.module.diagnose.entity.DiagnoseReview;
import com.phucnguyen.agriai.module.diagnose.repository.DiagnoseReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final DiagnoseReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Page<AdminReviewResponse> getReviews(Pageable pageable) {
        return reviewRepository.findAllNotDeleted(pageable).map(this::mapToResponse);
    }

    private AdminReviewResponse mapToResponse(DiagnoseReview review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .historyId(review.getHistory() != null ? review.getHistory().getId() : null)
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userFullName(review.getUser() != null ? review.getUser().getFullName() : "N/A")
                .accurate(review.getAccurate())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
