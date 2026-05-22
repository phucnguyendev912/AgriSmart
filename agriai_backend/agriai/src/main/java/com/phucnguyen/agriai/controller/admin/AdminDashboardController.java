package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.response.admin.AdminDashboardResponse;
import com.phucnguyen.agriai.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Controller for retrieving dashboard statistics for system administrators
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    // Get aggregated statistics (e.g. total users, diagnoses) for the specified period in days
    @GetMapping
    public ResponseEntity<AdminDashboardResponse> getDashboard(
            @RequestParam(defaultValue = "30") int periodDays) {
        return ResponseEntity.ok(adminDashboardService.getDashboard(periodDays));
    }
}
