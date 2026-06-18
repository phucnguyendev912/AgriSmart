package com.phucnguyen.agriai.module.user.controller;

import com.phucnguyen.agriai.module.user.dto.request.ProfileUpdateRequest;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;
import com.phucnguyen.agriai.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
