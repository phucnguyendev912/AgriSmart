package com.phucnguyen.agriai.module.attachment.entity;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "Attachment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Attachment extends BaseEntity {
    @Column(name = "fileName", length = 255)
    private String fileName;

    @Column(name = "fileUrl", length = 500)
    private String fileUrl;

    @Column(name = "fileType", length = 50)
    private String fileType;

    @Column(name = "fileSize")
    private Long fileSize;

    @Column(name = "referenceType", length = 50)
    private String referenceType;

    @Column(name = "referenceId")
    private Integer referenceId;

    @Column(name = "mimeType", length = 100)
    private String mimeType;

    @Column(name = "category", length = 50)
    private String category;
}
