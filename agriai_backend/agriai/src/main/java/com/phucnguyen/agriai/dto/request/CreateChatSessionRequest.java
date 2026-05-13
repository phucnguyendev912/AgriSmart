package com.phucnguyen.agriai.dto.request;

import jakarta.validation.constraints.Size;
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
public class CreateChatSessionRequest {
    @Size(max = 255, message = "Session title must not exceed 255 characters.")
    private String sessionTitle;
}
