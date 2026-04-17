package com.phucnguyen.agriai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisionResultDTO {
    private String label;
    private Double confidence;
    private String severity;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
}
