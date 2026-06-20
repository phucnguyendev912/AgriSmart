package com.phucnguyen.agriai.module.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.phucnguyen.agriai.module.auth.dto.request.LoginRequest;
import com.phucnguyen.agriai.module.auth.dto.request.RegisterRequest;
import com.phucnguyen.agriai.module.auth.dto.response.LoginResponse;
import com.phucnguyen.agriai.module.user.dto.response.UserResponse;
import com.phucnguyen.agriai.module.user.entity.Role;
import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.module.auth.enums.AuthProvider;
import com.phucnguyen.agriai.infrastructure.exception.AppException;
import com.phucnguyen.agriai.module.user.repository.RoleRepository;
import com.phucnguyen.agriai.module.user.repository.UserRepository;
import com.phucnguyen.agriai.infrastructure.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    // ── Constructor ────────────────────────────────────────────
    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Value("${google.client-id}")
    private String googleClientId;

    // ── Email/Password ────────────────────────────────────────────

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email))
            throw new AppException(HttpStatus.CONFLICT, "Email này đã được sử dụng.");
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber()))
            throw new AppException(HttpStatus.CONFLICT, "Số điện thoại này đã được sử dụng.");
        if (!request.getPassword().equals(request.getPasswordConfirm()))
            throw new AppException(HttpStatus.BAD_REQUEST, "Mật khẩu xác nhận không khớp.");

        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy quyền USER."));
        // tạo 1 user mới
        User newUser = User.builder()
                .fullName(request.getFullName().trim()).email(email)
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(true).role(role).build();
        // Lưu vào database
        User saved = userRepository.save(newUser);
        // Trả về response cho user
        return UserResponse.builder().id(saved.getId()).fullName(saved.getFullName())
                .email(saved.getEmail()).phoneNumber(saved.getPhoneNumber())
                .role(saved.getRole().getRoleName())
                .avatarUrl(saved.getAttachment() != null ? saved.getAttachment().getFileUrl() : null).build();
    }

    // Đăng nhập
    public LoginResponse login(LoginRequest request) {
        // Lấy email với kí tự thường
        String email = request.getEmail().trim().toLowerCase();
        // Xác thực email và mật khẩu
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        // Tìm user trong database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));
        // Tạo Spring Security UserDetails
        UserDetails springUser = toSpringUser(user);
        // Tạo response trả về cho user
        return LoginResponse.builder()
                .token(jwtService.generateToken(springUser))
                .refreshToken(jwtService.generateRefreshToken(springUser))
                .user(toUserResponse(user))
                .build();
    }

    public LoginResponse refreshToken(String refreshToken) {
        // khai bao email và kiểm tra xem trong refresh token có email hợp lệ không
        String userEmail;
        try {
            userEmail = jwtService.extractUsername(refreshToken);
        } catch (Exception ex) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ.");
        }
        // Tìm user trong database
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));
        // Tạo Spring Security UserDetails
        UserDetails springUser = toSpringUser(user);
        // Kiểm tra refresh token còn hợp lệ không
        if (!jwtService.isTokenValid(refreshToken, springUser))
            throw new AppException(HttpStatus.UNAUTHORIZED, "Refresh token không hợp lệ.");
        // Tạo response trả về cho user
        return LoginResponse.builder()
                .token(jwtService.generateToken(springUser))
                .refreshToken(refreshToken)
                .user(toUserResponse(user))
                .build();
    }

    // Google OAuth2

    public LoginResponse loginWithGoogle(String idToken) {
        // 1. Xác thực Google token
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String googleSub = payload.getSubject();
        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();
        String fullName = (String) payload.get("name");

        // 2. Kiểm tra email đã được xác minh chưa
        if (Boolean.FALSE.equals(emailVerified))
            throw new AppException(HttpStatus.BAD_REQUEST, "Email Google chưa được xác minh.");

        // 3. Kiểm tra email đã tồn tại với tài khoản LOCAL → tự động link thay vì báo
        // lỗi
        if (email != null) {
            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent() && existingByEmail.get().getProvider() == AuthProvider.LOCAL) {
                User localUser = existingByEmail.get();
                // Kiểm tra tài khoản có bị khóa không
                if (Boolean.FALSE.equals(localUser.getIsActive()))
                    throw new AppException(HttpStatus.FORBIDDEN,
                            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.");
                // Link tài khoản Google vào tài khoản LOCAL hiện có
                return buildLoginResponse(linkGoogleToLocalUser(localUser, googleSub));
            }
        }

        // 4. Tìm user theo providerId hoặc tạo mới (nếu chưa tồn tại)
        User user = userRepository
                .findByProviderAndProviderId(AuthProvider.GOOGLE, googleSub)
                .orElseGet(() -> createSocialUser(fullName, email, AuthProvider.GOOGLE, googleSub));

        return buildLoginResponse(user);
    }

    // Xác thực Google token
    protected GoogleIdToken.Payload verifyGoogleToken(String idTokenString) {
        try {
            // Khởi tạo GoogleIdTokenVerifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    // Thiết lập audience là googleClientId
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            // Xác thực token
            GoogleIdToken token = verifier.verify(idTokenString);
            if (token == null)
                throw new AppException(HttpStatus.UNAUTHORIZED, "Google token không hợp lệ.");
            return token.getPayload();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Google token không hợp lệ.");
        }
    }

    // Liên kết tài khoản Google vào tài khoản LOCAL hiện có
    private User linkGoogleToLocalUser(User localUser, String googleSub) {
        localUser.setProvider(AuthProvider.GOOGLE);
        localUser.setProviderId(googleSub);
        return userRepository.save(localUser);
    }

    // Tạo user mới từ thông tin mạng xã hội
    private User createSocialUser(String fullName, String email, AuthProvider provider, String providerId) {
        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy quyền USER."));
        User user = User.builder()
                .fullName(fullName != null ? fullName : "Người dùng")
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .isActive(true)
                .role(role)
                .build();
        return userRepository.save(user);
    }

    // Tạo response login
    private LoginResponse buildLoginResponse(User user) {
        UserDetails springUser = toSpringUser(user);
        return LoginResponse.builder()
                .token(jwtService.generateToken(springUser))
                .refreshToken(jwtService.generateRefreshToken(springUser))
                .user(toUserResponse(user))
                .build();
    }

    // Chuyển user sang UserResponse
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().getRoleName() : "USER")
                .avatarUrl(user.getAttachment() != null ? user.getAttachment().getFileUrl() : null)
                .build();
    }

    // Chuyển user sang Spring Security UserDetails
    private UserDetails toSpringUser(User user) {
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        // Social users không có email, dùng providerId làm username
        String username = user.getEmail() != null ? user.getEmail() : user.getProviderId();
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "";
        return org.springframework.security.core.userdetails.User.builder()
                .username(username).password(password).roles(roleName).build();
    }

}
