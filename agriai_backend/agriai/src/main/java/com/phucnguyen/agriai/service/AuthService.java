package com.phucnguyen.agriai.service;

import com.phucnguyen.agriai.dto.request.LoginRequest;
import com.phucnguyen.agriai.dto.request.RegisterRequest;
import com.phucnguyen.agriai.dto.response.LoginResponse;
import com.phucnguyen.agriai.dto.response.UserResponse;
import com.phucnguyen.agriai.entity.Role;
import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.exception.AppException;
import com.phucnguyen.agriai.repository.RoleRepository;
import com.phucnguyen.agriai.repository.UserRepository;
import com.phucnguyen.agriai.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service

@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authenticationManager;

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email))
            throw new AppException(HttpStatus.CONFLICT, "Email nay da duoc su dung.");
        if (!request.getPassword().equals(request.getPasswordConfirm()))
            throw new AppException(HttpStatus.BAD_REQUEST, "Mat khau xac nhan khong khop.");

        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Khong tim thay quyen USER."));

        User newUser = User.builder()
                .fullName(request.getFullName().trim()).email(email)
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(true).role(role).build();

        User saved = userRepository.save(newUser);
        return UserResponse.builder().id(saved.getId()).fullName(saved.getFullName())
                .email(saved.getEmail()).phoneNumber(saved.getPhoneNumber())
                .role(saved.getRole().getRoleName()).build();
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Tai khoan khong truy xuat duoc."));

        UserDetails springUser = toSpringUser(user);
        return LoginResponse.builder()
                .token(jwtService.generateToken(springUser))
                .refreshToken(jwtService.generateRefreshToken(springUser))
                .user(UserResponse.builder().id(user.getId()).fullName(user.getFullName())
                        .email(user.getEmail()).phoneNumber(user.getPhoneNumber())
                        .role(user.getRole() != null ? user.getRole().getRoleName() : "USER").build())
                .build();
    }

    public LoginResponse refreshToken(String refreshToken) {
        String userEmail;
        try {
            userEmail = jwtService.extractUsername(refreshToken);
        } catch (Exception ex) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token khong hop le.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Tai khoan khong ton tai."));

        UserDetails springUser = toSpringUser(user);
        if (!jwtService.isTokenValid(refreshToken, springUser))
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token khong hop le.");

        return LoginResponse.builder()
                .token(jwtService.generateToken(springUser))
                .refreshToken(refreshToken).build();
    }

    private UserDetails toSpringUser(User user) {
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail()).password(user.getPasswordHash()).roles(roleName).build();
    }
}
