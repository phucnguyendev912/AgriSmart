package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isDelete = false")
    long countTotalUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.isDelete = false")
    long countActiveUsers();

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
}
