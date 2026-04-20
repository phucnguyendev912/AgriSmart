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
import java.util.Optional;

/**
 * Xử lý nghiệp vụ đánh giá kết quả chẩn đoán.
 * Hỗ trợ tạo mới và cập nhật đánh giá.
 * Mỗi lần chẩn đoán chỉ có tối đa 1 đánh giá (upsert logic).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DiagnoseReviewService {

    private final DiagnoseReviewRepository reviewRepository;
    private final DiagnoseHistoryRepository historyRepository;
    private final UserRepository userRepository;

    /**
     * Tạo mới đánh giá cho một lần chẩn đoán.
     * Yêu cầu: Người dùng phải đăng nhập, và chẩn đoán chưa được đánh giá trước đó.
     *
     * @param email   Email của người dùng đang đăng nhập
     * @param request DTO chứa dữ liệu đánh giá
     * @return DiagnoseReviewResponse đã lưu
     */
    public DiagnoseReviewResponse submitReview(String email, DiagnoseReviewRequest request) {
        if (email == null || email.isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để đánh giá.");
        }

        DiagnoseHistory history = historyRepository.findById(request.getHistoryId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch sử chẩn đoán."));

        // Kiểm tra quyền sở hữu: Người dùng chỉ được đánh giá chẩn đoán của chính mình
        // (nếu lịch sử có userId)
        if (history.getUser() != null && !history.getUser().getEmail().equals(email)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền đánh giá kết quả này.");
        }

        // Kiểm tra xem đã có đánh giá chưa - Theo yêu cầu: không được sửa
        if (reviewRepository.existsByHistoryId(request.getHistoryId())) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Kết quả này đã được đánh giá trước đó và không thể sửa đổi.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin người dùng."));

        DiagnoseReview review = DiagnoseReview.builder()
                .history(history)
                .user(user)
                .accurate(request.getIsAccurate())
                .rating(request.getRating())
                .feedback(request.getFeedback())
                .build();

        DiagnoseReview saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    /**
     * Lấy đánh giá theo historyId.
     * Dùng để hiển thị trạng thái đánh giá trong trang lịch sử.
     *
     * @param historyId ID của lần chẩn đoán
     * @return Optional chứa DiagnoseReviewResponse nếu đã có đánh giá
     */
    @Transactional(readOnly = true)
    public Optional<DiagnoseReviewResponse> getByHistoryId(Integer historyId) {
        return reviewRepository.findByHistoryId(historyId).map(this::toResponse);
    }

    /**
     * Map entity DiagnoseReview → DTO DiagnoseReviewResponse.
     */
    private DiagnoseReviewResponse toResponse(DiagnoseReview review) {
        return DiagnoseReviewResponse.builder()
                .id(review.getId())
                .historyId(review.getHistory().getId())
                .isAccurate(review.getAccurate())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
