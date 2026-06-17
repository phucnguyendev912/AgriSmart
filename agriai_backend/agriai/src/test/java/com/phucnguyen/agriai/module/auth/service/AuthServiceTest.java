package com.phucnguyen.agriai.module.auth.service;
import com.phucnguyen.agriai.module.auth.service.AuthService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.phucnguyen.agriai.module.auth.dto.request.RegisterRequest;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;
import com.phucnguyen.agriai.module.user.entity.Role;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.user.repository.RoleRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import com.phucnguyen.agriai.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.phucnguyen.agriai.module.auth.dto.response.LoginResponse;
import com.phucnguyen.agriai.module.auth.enums.AuthProvider;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

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

    @Mock
    private RestTemplate restTemplate;

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

    @Test
    void loginWithGoogle_success_newUser() {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setSubject("google-sub-123");
        payload.setEmail("google@gmail.com");
        payload.setEmailVerified(true);
        payload.set("name", "Google User");

        AuthService spyService = spy(authService);
        doReturn(payload).when(spyService).verifyGoogleToken("valid-google-token");

        when(userRepository.findByEmail("google@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google-sub-123")).thenReturn(Optional.empty());
        
        Role role = Role.builder().id(1).roleName("USER").build();
        when(roleRepository.findByRoleName("USER")).thenReturn(Optional.of(role));

        User savedUser = User.builder()
                .id(101)
                .fullName("Google User")
                .email("google@gmail.com")
                .provider(AuthProvider.GOOGLE)
                .providerId("google-sub-123")
                .role(role)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("dummy-jwt-access-token");
        when(jwtService.generateRefreshToken(any(UserDetails.class))).thenReturn("dummy-jwt-refresh-token");

        LoginResponse response = spyService.loginWithGoogle("valid-google-token");

        assertNotNull(response);
        assertEquals("dummy-jwt-access-token", response.getToken());
        assertEquals("dummy-jwt-refresh-token", response.getRefreshToken());
        assertEquals("google@gmail.com", response.getUser().getEmail());
        assertEquals("Google User", response.getUser().getFullName());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginWithGoogle_emailExistsWithLocalProvider_linksAccount() {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setSubject("google-sub-123");
        payload.setEmail("local@gmail.com");
        payload.setEmailVerified(true);

        AuthService spyService = spy(authService);
        doReturn(payload).when(spyService).verifyGoogleToken("valid-google-token");

        Role role = Role.builder().id(1).roleName("USER").build();
        User existingLocalUser = User.builder()
                .id(102)
                .email("local@gmail.com")
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .role(role)
                .build();
        when(userRepository.findByEmail("local@gmail.com")).thenReturn(Optional.of(existingLocalUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("dummy-jwt-access-token");
        when(jwtService.generateRefreshToken(any(UserDetails.class))).thenReturn("dummy-jwt-refresh-token");

        LoginResponse response = spyService.loginWithGoogle("valid-google-token");

        assertNotNull(response);
        assertEquals("dummy-jwt-access-token", response.getToken());
        assertEquals("dummy-jwt-refresh-token", response.getRefreshToken());
        assertEquals("local@gmail.com", response.getUser().getEmail());
        assertEquals(AuthProvider.GOOGLE, existingLocalUser.getProvider());
        assertEquals("google-sub-123", existingLocalUser.getProviderId());

        verify(userRepository).save(any(User.class));
    }
}
