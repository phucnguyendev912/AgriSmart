package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.DiagnoseReviewRequest;
import com.phucnguyen.agriai.dto.response.DiagnoseReviewResponse;
import com.phucnguyen.agriai.service.DiagnoseReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import org.springframework.web.bind.annotation.GetMapping;

// Controller for managing user reviews and feedback on AI diagnosis results
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class DiagnoseReviewController {

    private final DiagnoseReviewService reviewService;

    // Submit a review or feedback for a specific diagnosis session
    @PostMapping
    public ResponseEntity<DiagnoseReviewResponse> submitReview(
            Principal principal,
            @RequestBody DiagnoseReviewRequest request) {
        String email = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(reviewService.submitReview(email, request));
    }

    // Get the review details of a specific diagnosis session by history ID
    @GetMapping("/{historyId}")
    public ResponseEntity<DiagnoseReviewResponse> getReview(@PathVariable Integer historyId) {
        Optional<DiagnoseReviewResponse> review = reviewService.getByHistoryId(historyId);
        return review.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all diagnosis reviews submitted by users
    @GetMapping("/all")
    public ResponseEntity<List<DiagnoseReviewResponse>> getAllReview() {
        return ResponseEntity.ok(reviewService.getAllReview());
    }

}
