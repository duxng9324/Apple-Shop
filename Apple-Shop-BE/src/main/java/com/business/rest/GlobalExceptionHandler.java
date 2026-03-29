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
                ex.getMessage() != null ? ex.getMessage() : "Conflict: Data was modified concurrently",
                "Another user modified this data. Please refresh and try again.",
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
            HttpServletRequest request) {
        ApiErrorResponse error = new ApiErrorResponse(
                "BAD_REQUEST",
                "Invalid argument",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeException(RuntimeException ex,
            HttpServletRequest request) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Internal Server Error";
        String code = "SERVER_ERROR";

        if (message.contains("Order not found") || message.contains("User not found") || 
            message.contains("Warehouse not found") || message.contains("Product not found") ||
            message.contains("not found")) {
            code = "NOT_FOUND";
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiErrorResponse(code, message, request.getRequestURI()));
        }

        if (message.contains("Unauthorized") || message.contains("Forbidden")) {
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
                "An unexpected error occurred",
                ex.getMessage(),
                request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
