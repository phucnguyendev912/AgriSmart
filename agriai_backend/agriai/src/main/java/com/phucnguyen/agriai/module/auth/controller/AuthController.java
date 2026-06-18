package com.phucnguyen.agriai.module.auth.controller;

import com.phucnguyen.agriai.module.auth.dto.request.GoogleLoginRequest;
import com.phucnguyen.agriai.module.auth.dto.request.LoginRequest;
import com.phucnguyen.agriai.module.auth.dto.request.RegisterRequest;
import com.phucnguyen.agriai.module.auth.dto.response.LoginResponse;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;
import com.phucnguyen.agriai.module.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse lr = authService.login(request);
        // Set short-lived access token in HttpOnly cookie (1 hour)
        Cookie access = new Cookie("accessToken", lr.getToken());
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge(3600);
        // Set long-lived refresh token in HttpOnly cookie (7 days)
        Cookie refresh = new Cookie("refreshToken", lr.getRefreshToken());
        refresh.setHttpOnly(true);
        refresh.setPath("/");
        refresh.setMaxAge(7 * 24 * 3600);
        response.addCookie(access);
        response.addCookie(refresh);
        return ResponseEntity.ok(LoginResponse.builder()
                .user(lr.getUser())
                .build());
    }

    // Refresh token
    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken == null)
            return ResponseEntity.status(401).build();
        LoginResponse lr = authService.refreshToken(refreshToken);
        // Issue a new short-lived access token cookie
        Cookie access = new Cookie("accessToken", lr.getToken());
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge(3600);
        response.addCookie(access);
        return ResponseEntity.ok(LoginResponse.builder()
                .user(lr.getUser())
                .build());
    }

    // Logout
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie a = new Cookie("accessToken", null);
        a.setHttpOnly(true);
        a.setPath("/");
        a.setMaxAge(0);
        Cookie r = new Cookie("refreshToken", null);
        r.setHttpOnly(true);
        r.setPath("/");
        r.setMaxAge(0);
        response.addCookie(a);
        response.addCookie(r);
        return ResponseEntity.noContent().build();
    }

    // Đăng nhập Google
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(
            @Valid @RequestBody GoogleLoginRequest request, HttpServletResponse response) {
        LoginResponse lr = authService.loginWithGoogle(request.getIdToken());
        setAuthCookies(response, lr);
        return ResponseEntity.ok(LoginResponse.builder().user(lr.getUser()).build());
    }

    // Set cookies
    private void setAuthCookies(HttpServletResponse response, LoginResponse lr) {
        Cookie access = new Cookie("accessToken", lr.getToken());
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge(3600);
        Cookie refresh = new Cookie("refreshToken", lr.getRefreshToken());
        refresh.setHttpOnly(true);
        refresh.setPath("/");
        refresh.setMaxAge(7 * 24 * 3600);
        response.addCookie(access);
        response.addCookie(refresh);
    }
}
