package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.LoginRequest;
import com.phucnguyen.agriai.dto.request.RegisterRequest;
import com.phucnguyen.agriai.dto.response.LoginResponse;
import com.phucnguyen.agriai.dto.response.UserResponse;
import com.phucnguyen.agriai.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        LoginResponse lr = authService.login(request);
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
        return ResponseEntity.ok(lr);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        if (refreshToken == null)
            return ResponseEntity.status(401).build();
        LoginResponse lr = authService.refreshToken(refreshToken);
        Cookie access = new Cookie("accessToken", lr.getToken());
        access.setHttpOnly(true);
        access.setPath("/");
        access.setMaxAge(3600);
        response.addCookie(access);
        return ResponseEntity.ok(lr);
    }

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
}
