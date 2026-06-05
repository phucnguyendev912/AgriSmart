package com.phucnguyen.agriai.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Integer id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String mimeType;
    private String category;
    private String referenceType;
    private Integer referenceId;
    private java.time.LocalDateTime createdAt;
    private Boolean isDelete;
}
