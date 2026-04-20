package com.phucnguyen.agriai.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * DTO nhận request đánh giá từ frontend.
 * Tất cả các trường đều optional để hỗ trợ đánh giá một phần.
 */
@Data
public class DiagnoseReviewRequest {
    /** ID của lần chẩn đoán cần đánh giá */
    private Integer historyId;

    /**
     * true = chính xác, false = không chính xác, null = chưa chọn.
     * 
     * @JsonProperty cần thiết để Jackson không tự đổi tên thành "accurate".
     */
    @JsonProperty("isAccurate")
    private Boolean isAccurate;

    /** Số sao từ 1-5, null nếu bỏ qua */
    private Integer rating;

    /** Nhận xét tự do */
    private String feedback;
}
