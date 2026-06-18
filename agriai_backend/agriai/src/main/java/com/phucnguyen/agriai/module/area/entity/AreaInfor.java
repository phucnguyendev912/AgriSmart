package com.phucnguyen.agriai.module.area.entity;
import com.phucnguyen.agriai.module.user.entity.User;

import com.phucnguyen.agriai.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "AreaInfor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@SuperBuilder
public class AreaInfor extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "areaCode", length = 50)
    private String areaCode;

    @Column(name = "areaName", length = 100)
    private String areaName;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "area")
    private Double area;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

}
