package com.phucnguyen.agriai.infrastructure.security;

import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.module.user.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    // @Transactional to prevent LazyInitializationException when loading
    // user.getRole() in SecurityContext
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + email));

        if (Boolean.TRUE.equals(user.getIsDelete())) {
            throw new UsernameNotFoundException("Không tìm thấy tài khoản: " + email);
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .disabled(Boolean.FALSE.equals(user.getIsActive()))
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName)))
                .build();
    }
}
