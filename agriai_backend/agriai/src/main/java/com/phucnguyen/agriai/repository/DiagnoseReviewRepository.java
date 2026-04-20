package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.DiagnoseReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository truy vấn bảng DiagnoseReview.
 */
@Repository
public interface DiagnoseReviewRepository extends JpaRepository<DiagnoseReview, Integer> {

    /**
     * Tìm đánh giá theo ID của lần chẩn đoán.
     * Dùng để kiểm tra xem chẩn đoán đã có đánh giá chưa
     * rồi mới cho phép tạo hoặc cập nhật.
     *
     * @param historyId ID của DiagnoseHistory
     * @return Optional chứa DiagnoseReview nếu đã tồn tại
     */
    Optional<DiagnoseReview> findByHistoryId(Integer historyId);

    /**
     * Kiểm tra xem một chẩn đoán đã có đánh giá chưa.
     *
     * @param historyId ID của DiagnoseHistory
     * @return true nếu đã có đánh giá
     */
    boolean existsByHistoryId(Integer historyId);
}
