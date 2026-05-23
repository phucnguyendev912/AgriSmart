package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.ProfileUpdateRequest;
import com.phucnguyen.agriai.dto.response.UserResponse;
import com.phucnguyen.agriai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

// Controller for managing user profile details
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Update profile information (e.g. name, phone) of the logged-in user
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            Principal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }
}
