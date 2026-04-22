package com.phucnguyen.agriai.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// response for soft delete chat session
public class SoftDeleteChatSessionResponse {
    private Integer id;
    private Boolean isDelete;
    private LocalDateTime deletedAt;
}
