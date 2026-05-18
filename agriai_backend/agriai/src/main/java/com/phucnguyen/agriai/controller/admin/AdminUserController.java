package com.phucnguyen.agriai.controller.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateUserRequest;
import com.phucnguyen.agriai.dto.request.admin.AdminUpdateUserRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminUserResponse;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.repository.UserRepository;
import com.phucnguyen.agriai.service.admin.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<AdminUserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(adminUserService.getUsers(page, size, role, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<AdminUserResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponse> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    @PatchMapping("/{id}/delete")
    public ResponseEntity<Map<String, String>> softDeleteUser(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails currentUser) {
        Integer currentAdminId = resolveAdminId(currentUser.getUsername());
        adminUserService.softDeleteUser(id, currentAdminId);
        return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công."));
    }

    // Resolve current admin user id from email
    private Integer resolveAdminId(String email) {
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin."));
    }
}
