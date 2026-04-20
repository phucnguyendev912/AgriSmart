package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Lưu trữ đánh giá của người dùng cho một lần chẩn đoán.
 * Mỗi lần chẩn đoán (DiagnoseHistory) chỉ có TỐI ĐA một đánh giá.
 */
@Entity
@Table(name = "DiagnoseReview")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DiagnoseReview extends BaseEntity {

    /** Liên kết 1-1 đến lần chẩn đoán được đánh giá */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historyId", nullable = false, unique = true)
    private DiagnoseHistory history;

    /** Người dùng thực hiện đánh giá */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    /**
     * Đánh giá chính xác: true = chính xác, false = không chính xác.
     */
    @Column(name = "isAccurate")
    private Boolean accurate;

    /** Đánh giá số sao từ 1 đến 5, nullable nếu bỏ qua bước này */
    @Column(name = "rating")
    private Integer rating;

    /** Nhận xét tự do, tùy chọn */
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
}
