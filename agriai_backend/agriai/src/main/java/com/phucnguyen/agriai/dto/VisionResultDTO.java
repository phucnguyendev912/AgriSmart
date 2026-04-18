package com.phucnguyen.agriai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisionResultDTO {
    private String label; // Hoặc "diseaseName" nếu API trả về key khác, nhưng hiện tại code đang dùng
                          // getLabel()
    private Double confidence;
    private String severity;
}
