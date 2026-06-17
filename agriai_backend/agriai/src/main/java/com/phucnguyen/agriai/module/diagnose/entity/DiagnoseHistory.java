package com.phucnguyen.agriai.module.diagnose.entity;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.module.crop.entity.CropType;
import com.phucnguyen.agriai.module.area.entity.AreaInfor;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import com.phucnguyen.agriai.module.user.enums.Status;
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

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;
}
