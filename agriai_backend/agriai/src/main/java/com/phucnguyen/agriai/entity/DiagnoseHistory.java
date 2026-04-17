package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import com.phucnguyen.agriai.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "DiagnoseHistory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DiagnoseHistory extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "croptypeId")
    private CropType cropType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "areainfoId")
    private AreaInfor areaInfor;

    @Column(name = "originalimageURL", length = 255)
    private String originalImageUrl;

    @Column(name = "weatherData", columnDefinition = "TEXT")
    private String weatherData;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;
}
