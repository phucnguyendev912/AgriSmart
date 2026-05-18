package com.phucnguyen.agriai.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String INVALID_IMAGE_MESSAGE = "Ảnh không hợp lệ, vui lòng thử lại";
    private static final String MISSING_CROP_MESSAGE = "Vui lòng chọn loại cây trồng trước khi chẩn đoán";
    private static final String SYSTEM_ERROR_MESSAGE = "Có lỗi xảy ra, vui lòng thử lại sau";

    // =========================================================================
    // MODULE: Toàn bộ service (AppException là exception chính của hệ thống)
    // Bao gồm: Auth, Diagnose, Area, History, Review, Chat, User
    // =========================================================================
    @ExceptionHandler(AppException.class)
    public ResponseEntity<Map<String, Object>> handleAppException(AppException ex) {
        log.warn("[AppException] status={} message={}", ex.getStatus(), ex.getMessage());
        return buildError(ex.getStatus(), ex.getMessage());
    }

    // =========================================================================
    // MODULE: Auth – đăng nhập sai email/mật khẩu (AuthService.login)
    // Spring Security ném AuthenticationException trước khi vào service
    // =========================================================================
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        return buildError(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác.");
    }

    // =========================================================================
    // MODULE: Security – user đã đăng nhập nhưng không có quyền (@PreAuthorize)
    // Ví dụ: USER cố gắng gọi API chỉ dành cho ADMIN
    // =========================================================================
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        return buildError(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này.");
    }

    // =========================================================================
    // MODULE: Auth / User – vi phạm ràng buộc unique của DB
    // Ví dụ: đăng ký email đã tồn tại (dù AuthService đã check trước, DB là lớp
    // cuối)
    // =========================================================================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("[DataIntegrityViolation] {}", ex.getMostSpecificCause().getMessage());
        return buildError(HttpStatus.CONFLICT, "Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc của hệ thống.");
    }

    // =========================================================================
    // MODULE: Diagnose – upload ảnh vượt quá giới hạn kích thước
    // Cấu hình ở: spring.servlet.multipart.max-file-size
    // =========================================================================
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return buildError(HttpStatus.PAYLOAD_TOO_LARGE, INVALID_IMAGE_MESSAGE);
    }

    // =========================================================================
    // MODULE: Diagnose – lỗi multipart request (ảnh bị lỗi khi parse, content-type
    // sai)
    // Xảy ra khi gọi POST /api/diagnosis mà thiếu file hoặc sai content-type
    // =========================================================================
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipart(MultipartException ex) {
        return buildError(HttpStatus.BAD_REQUEST, INVALID_IMAGE_MESSAGE);
    }

    // =========================================================================
    // MODULE: Tất cả API – body JSON gửi lên sai cú pháp hoặc không parse được
    // =========================================================================
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Dữ liệu gửi lên không đọc được hoặc sai định dạng JSON.");
    }

    // =========================================================================
    // MODULE: Tất cả API – thiếu query param bắt buộc (ví dụ: ?page=)
    // =========================================================================
    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(
            org.springframework.web.bind.MissingServletRequestParameterException ex) {
        return buildError(HttpStatus.BAD_REQUEST, "Thiếu tham số bắt buộc: " + ex.getParameterName());
    }

    // =========================================================================
    // MODULE: Tất cả API – lỗi validate @Valid trên DTO (email rỗng, sdt sai, v.v.)
    // =========================================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage,
                        (first, second) -> first, LinkedHashMap::new));
        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, resolveValidationMessage(fieldErrors));
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> handleBindException(BindException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage,
                        (first, second) -> first, LinkedHashMap::new));
        Map<String, Object> body = baseBody(HttpStatus.BAD_REQUEST, resolveValidationMessage(fieldErrors));
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    // =========================================================================
    // MODULE: Routing – gọi endpoint không tồn tại (Spring 6+)
    // =========================================================================
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        return buildError(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu.");
    }

    // =========================================================================
    // MODULE: Cloudinary – upload ảnh thất bại (CloudinaryService throw
    // RuntimeException)
    // Cũng bắt các RuntimeException không mong đợi từ bất kỳ service nào khác
    // =========================================================================
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("[RuntimeException] {}", ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ERROR_MESSAGE);
    }

    // =========================================================================
    // FALLBACK – bắt mọi exception còn lại (checked exception, IOException, v.v.)
    // =========================================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("[UnhandledException] {}", ex.getMessage(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, SYSTEM_ERROR_MESSAGE);
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(baseBody(status, message));
    }

    private String resolveValidationMessage(Map<String, String> fieldErrors) {
        if (fieldErrors.containsKey("cropTypeId")) {
            return MISSING_CROP_MESSAGE;
        }
        if (fieldErrors.containsKey("image")) {
            return INVALID_IMAGE_MESSAGE;
        }
        return "Dữ liệu gửi lên không hợp lệ.";
    }

    private Map<String, Object> baseBody(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return body;
    }
}
