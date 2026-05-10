package com.notifyengine.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access denied. Please login to the dashboard.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("Unhandled exception: ", e);
        Map<String, String> error = new HashMap<>();
        
        if (e.getMessage() != null && e.getMessage().contains("Rate limit exceeded")) {
            error.put("error", "Rate Limit Exceeded");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }

        if (e.getMessage() != null && (e.getMessage().contains("Unauthorized") || e.getMessage().contains("JWT"))) {
            error.put("error", "Invalid or expired session. Please login again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        error.put("error", e.getMessage() != null ? e.getMessage() : "Internal Server Error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
