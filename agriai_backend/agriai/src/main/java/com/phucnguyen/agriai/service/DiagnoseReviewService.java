package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.DiagnoseReviewRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseReviewResponse;
import com.phucnguyen.agriai.entity.DiagnoseHistory;
import com.phucnguyen.agriai.entity.DiagnoseReview;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.DiagnoseHistoryRepository;
import com.phucnguyen.agriai.repository.DiagnoseReviewRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Service handling user submission and retrieval of diagnosis feedback reviews
@Service
@RequiredArgsConstructor
@Transactional
public class DiagnoseReviewService {

    private final DiagnoseReviewRepository reviewRepository;
    private final DiagnoseHistoryRepository historyRepository;
    private final UserRepository userRepository;

    // Submit or update a diagnosis feedback review
    public DiagnoseReviewResponse submitReview(String email, DiagnoseReviewRequest request) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đánh giá.");
        }

        DiagnoseHistory history = historyRepository.findById(request.getHistoryId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch sử chẩn đoán."));

        if (history.getUser() != null && !history.getUser().getEmail().equals(email)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền đánh giá kết quả này.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng."));

        DiagnoseReview review = reviewRepository.findByHistoryId(request.getHistoryId())
                .orElseGet(() -> DiagnoseReview.builder()
                        .history(history)
                        .user(user)
                        .build());

        review.setAccurate(request.getIsAccurate());
        review.setRating(request.getRating());
        review.setFeedback(request.getFeedback());

        DiagnoseReview saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    // Fetch a feedback review by diagnosis history ID
    @Transactional(readOnly = true)
    public Optional<DiagnoseReviewResponse> getByHistoryId(Integer historyId) {
        return reviewRepository.findByHistoryId(historyId).map(this::toResponse);
    }

    // Map DiagnoseReview entity to response DTO
    private DiagnoseReviewResponse toResponse(DiagnoseReview review) {
        return DiagnoseReviewResponse.builder()
                .id(review.getId())
                .historyId(review.getHistory().getId())
                .isAccurate(review.getAccurate())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdAt(review.getCreatedAt())
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .build();
    }

    // Get all feedback reviews ordered by creation date descending
    public List<DiagnoseReviewResponse> getAllReview() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse)
                .collect(Collectors.toList());

    }
}
