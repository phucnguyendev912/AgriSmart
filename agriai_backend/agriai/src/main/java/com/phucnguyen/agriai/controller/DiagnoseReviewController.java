package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.DiagnoseReviewRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseReviewResponse;
import com.phucnguyen.agriai.service.DiagnoseReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Optional;

/**
 * REST Controller xử lý API đánh giá kết quả chẩn đoán.
 * Base path: /api/reviews
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class DiagnoseReviewController {

    private final DiagnoseReviewService reviewService;

    /**
     * POST /api/reviews
     * Tạo mới đánh giá cho một lần chẩn đoán.
     * Yêu cầu: Người dùng phải đăng nhập (endpoint được bảo vệ bởi SecurityConfig).
     *
     * @param principal Người dùng hiện tại (từ JWT)
     * @param request   Body chứa historyId, isAccurate, rating, feedback
     * @return 200 OK + DiagnoseReviewResponse đã lưu
     */
    @PostMapping
    public ResponseEntity<DiagnoseReviewResponse> submitReview(
            Principal principal,
            @RequestBody DiagnoseReviewRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(reviewService.submitReview(email, request));
    }

    /**
     * GET /api/reviews/{historyId}
     * Lấy đánh giá theo historyId. Dùng để kiểm tra trạng thái đánh giá
     * trước khi hiển thị nút "Đánh giá" hay "Đã đánh giá" trên trang lịch sử.
     *
     * @param historyId ID của DiagnoseHistory
     * @return 200 OK + DiagnoseReviewResponse nếu có, hoặc 404 nếu chưa có
     */
    @GetMapping("/{historyId}")
    public ResponseEntity<DiagnoseReviewResponse> getReview(@PathVariable Integer historyId) {
        Optional<DiagnoseReviewResponse> review = reviewService.getByHistoryId(historyId);
        return review.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
