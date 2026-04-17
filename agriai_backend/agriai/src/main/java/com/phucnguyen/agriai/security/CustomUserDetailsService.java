package com.phucnguyen.agriai.security;

import com.phucnguyen.agriai.entity.User;
import com.phucnguyen.agriai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    // @Transactional để tránh lỗi LazyInitializationException khi truy cập
    // user.getRole() trong SecurityContext
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản: " + email));

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa.");
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "USER";
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleName)));
    }
}
