package com.phucnguyen.agriai.entity;

import com.phucnguyen.agriai.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

// Stores user feedback and ratings for a crop diagnosis session.
// Each diagnosis history record has at most one review.
@Entity
@Table(name = "DiagnoseReview")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DiagnoseReview extends BaseEntity {

    // 1-1 relationship link to the evaluated diagnosis history
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historyId", nullable = false, unique = true)
    private DiagnoseHistory history;

    // The user who submitted the review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId")
    private User user;

    // Accuracy evaluation: true = accurate, false = inaccurate
    @Column(name = "isAccurate")
    private Boolean accurate;

    // Rating score from 1 to 5, nullable if skipped
    @Column(name = "rating")
    private Integer rating;

    // Optional open text feedback
    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
}
