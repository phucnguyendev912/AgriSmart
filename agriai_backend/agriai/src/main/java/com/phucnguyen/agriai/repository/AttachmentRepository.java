package com.phucnguyen.agriai.repository;

import com.phucnguyen.agriai.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    Optional<Attachment> findByIdAndIsDeleteFalse(Integer id);

    List<Attachment> findByReferenceIdIsNullAndIsDeleteFalseAndCreatedAtBefore(LocalDateTime dateTime);
}
