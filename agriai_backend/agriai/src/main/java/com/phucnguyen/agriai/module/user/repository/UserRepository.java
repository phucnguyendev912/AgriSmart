package com.phucnguyen.agriai.module.user.repository;

import com.phucnguyen.agriai.module.user.entity.User;
import com.phucnguyen.agriai.module.auth.enums.AuthProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isDelete = false")
    long countTotalUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.isDelete = false")
    long countActiveUsers();

    @Query("SELECT COUNT(u), SUM(CASE WHEN u.isActive = true THEN 1 ELSE 0 END) FROM User u WHERE u.isDelete = false")
    List<Object[]> getUserStats();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false AND u.isDelete = false")
    long countLockedUsers();

    @Query("""
            SELECT u FROM User u
            WHERE u.isDelete = false
              AND (:roleName IS NULL OR u.role.roleName = :roleName)
              AND (:isActive IS NULL OR u.isActive = :isActive)
            """)
    Page<User> findAllByFilter(
            @Param("roleName") String roleName,
            @Param("isActive") Boolean isActive,
            Pageable pageable);

    Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);

}
