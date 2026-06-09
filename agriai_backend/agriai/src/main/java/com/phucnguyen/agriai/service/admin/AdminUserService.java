package com.phucnguyen.agriai.service.admin;

import com.phucnguyen.agriai.dto.request.admin.AdminCreateUserRequest;
import com.phucnguyen.agriai.dto.request.admin.AdminUpdateUserRequest;
import com.phucnguyen.agriai.dto.response.admin.AdminUserResponse;
import com.phucnguyen.agriai.entity.Role;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.RoleRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(int page, int size, String roleName, Boolean isActive) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAllByFilter(roleName, isActive, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUserStats() {
        List<Object[]> statsRaw = userRepository.getUserStats();
        long totalUsers = 0;
        long activeUsers = 0;
        if (statsRaw != null && !statsRaw.isEmpty()) {
            Object[] row = statsRaw.get(0);
            totalUsers = ((Number) row[0]).longValue();
            activeUsers = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        }
        return Map.of("totalUsers", totalUsers, "activeUsers", activeUsers);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Integer id) {
        User user = findUserOrThrow(id);
        return toResponse(user);
    }

    public AdminUserResponse createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(HttpStatus.CONFLICT, "Email đã tồn tại trong hệ thống.");
        }

        Role role = findRoleOrThrow(request.getRoleId());

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .role(role)
                .build();

        return toResponse(userRepository.save(user));
    }

    public AdminUserResponse updateUser(Integer id, AdminUpdateUserRequest request) {
        User user = findUserOrThrow(id);
        Role role = findRoleOrThrow(request.getRoleId());

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(role);
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        return toResponse(userRepository.save(user));
    }

    // Soft deletes a user account, preventing an admin from deleting their own account.
    public void softDeleteUser(Integer targetId, Integer currentAdminId) {
        if (targetId.equals(currentAdminId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Không thể xóa tài khoản của chính mình.");
        }

        User user = findUserOrThrow(targetId);
        user.setIsDelete(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedBy(currentAdminId);
        userRepository.save(user);
    }

    private User findUserOrThrow(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng."));
        if (Boolean.TRUE.equals(user.getIsDelete())) {
            throw new AppException(HttpStatus.NOT_FOUND, "Người dùng đã bị xóa.");
        }
        return user;
    }

    private Role findRoleOrThrow(Integer roleId) {
        return roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy vai trò."));
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
