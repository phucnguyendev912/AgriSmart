package com.phucnguyen.agriai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.dto.request.RegisterRequest;
import com.phucnguyen.agriai.dto.response.UserResponse;
import com.phucnguyen.agriai.entity.Role;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.RoleRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import com.phucnguyen.agriai.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Nguyen Van A");
        request.setEmail("test@gmail.com");
        request.setPhoneNumber("0987654321");
        request.setPassword("password123");
        request.setPasswordConfirm("password123");

        Role role = Role.builder().id(1).roleName("USER").build();

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(false);
        when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(100);
            return user;
        });

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals("Nguyen Van A", response.getFullName());
        assertEquals("test@gmail.com", response.getEmail());
        assertEquals("0987654321", response.getPhoneNumber());
        assertEquals("USER", response.getRole());

        verify(userRepository).existsByEmail("test@gmail.com");
        verify(userRepository).existsByPhoneNumber("0987654321");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Email này đã được sử dụng.", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_duplicatePhoneNumber_throwsConflict() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setPhoneNumber("0987654321");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Số điện thoại này đã được sử dụng.", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_passwordMismatch_throwsBadRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setPhoneNumber("0987654321");
        request.setPassword("password123");
        request.setPasswordConfirm("different_pass");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Mật khẩu xác nhận không khớp.", exception.getMessage());

        verify(userRepository, never()).save(any(User.class));
    }
}
