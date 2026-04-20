// package com.phucnguyen.agriai.repository;

// import java.util.List;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import com.phucnguyen.agriai.entity.Notification;

// @Repository
// public interface NotificationRepository extends JpaRepository<Notification,
// Integer> {

// // Tìm danh sách thông báo của User, xếp theo thời gian mới nhất
// List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);
// }
