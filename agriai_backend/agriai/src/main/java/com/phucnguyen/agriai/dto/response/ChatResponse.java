package com.phucnguyen.agriai.dto.response;

import com.phucnguyen.agriai.enums.SenderType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ChatResponse — DTO phản hồi trả về cho frontend sau mỗi lần gửi tin nhắn.
 *
 * Chỉ chứa các trường thực sự cần thiết:
 * - sessionId / messageId: Để frontend có thể xác định và cập nhật UI.
 * - senderType: Phân biệt tin nhắn của USER hay AI.
 * - messageContent: Nội dung câu trả lời.
 * - createdAt: Thời gian để hiển thị timestamp.
 *
 * Đã loại bỏ (không còn cần thiết):
 * - responseType: Không còn phân loại AGRI_KNOWLEDGE / OUT_OF_SCOPE.
 * - references: Không còn danh sách nguồn tham khảo.
 * - suggestedAction: Không còn hành động gợi ý.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Integer sessionId;
    private Integer messageId;
    private SenderType senderType;
    private String messageContent;
    private LocalDateTime createdAt;
}
