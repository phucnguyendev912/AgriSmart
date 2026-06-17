package com.phucnguyen.agriai.module.attachment.repository;

import com.phucnguyen.agriai.module.attachment.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    Optional<Attachment> findByIdAndIsDeleteFalse(Integer id);

    List<Attachment> findByReferenceIdIsNullAndIsDeleteFalseAndCreatedAtBefore(LocalDateTime dateTime);

    @Query("""
        SELECT a FROM Attachment a
        WHERE (COALESCE(:search, '') = '' OR LOWER(a.fileName) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (COALESCE(:fileType, '') = '' OR a.fileType = :fileType)
          AND (COALESCE(:category, '') = '' OR a.category = :category)
          AND (:isDelete IS NULL OR a.isDelete = :isDelete)
        """)
    Page<Attachment> findAllByFilter(
            @Param("search") String search,
            @Param("fileType") String fileType,
            @Param("category") String category,
            @Param("isDelete") Boolean isDelete,
            Pageable pageable);
}
