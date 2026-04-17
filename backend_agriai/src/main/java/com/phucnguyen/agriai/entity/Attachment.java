package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
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
}
