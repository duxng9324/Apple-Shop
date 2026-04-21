package com.business.rest;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.business.dto.ApiErrorResponse;
import com.business.exception.OptimisticLockException;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ApiErrorResponse> handleOptimisticLock(OptimisticLockException ex,
            HttpServletRequest request) {
        ApiErrorResponse error = new ApiErrorResponse(
                ex.getCode() != null ? ex.getCode() : "OPTIMISTIC_LOCK_FAIL",
            ex.getMessage() != null ? ex.getMessage() : "Dữ liệu vừa được cập nhật đồng thời",
            "Dữ liệu đã thay đổi bởi người khác. Vui lòng tải lại và thử lại.",
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
            HttpServletRequest request) {
        ApiErrorResponse error = new ApiErrorResponse(
                "BAD_REQUEST",
            "Tham số không hợp lệ",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeException(RuntimeException ex,
            HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Lỗi hệ thống";
        String code = "SERVER_ERROR";

        if (message.contains("Order not found") || message.contains("User not found") || 
            message.contains("Warehouse not found") || message.contains("Product not found") ||
            message.contains("Không tìm thấy") ||
            message.contains("not found")) {
            code = "NOT_FOUND";
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse(code, message, request.getRequestURI()));
        }

        if (message.contains("Unauthorized") || message.contains("Forbidden")
                || message.contains("Bạn chưa đăng nhập") || message.contains("Bạn không có quyền truy cập")) {
            code = "FORBIDDEN";
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiErrorResponse(code, message, request.getRequestURI()));
        }

        if (message.contains("Insufficient inventory") || message.contains("Không đủ")) {
            code = "INSUFFICIENT_RESOURCE";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse(code, message, request.getRequestURI()));
        }

        ApiErrorResponse error = new ApiErrorResponse(code, message, request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(Exception ex,
            HttpServletRequest request) {
        ApiErrorResponse error = new ApiErrorResponse(
                "GENERAL_ERROR",
            "Đã xảy ra lỗi không mong muốn",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
