package com.notifyengine.analytics;

import com.notifyengine.notification.NotificationLog;
import com.notifyengine.notification.NotificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/analytics/by-channel")
    public ResponseEntity<Map<String, Object>> getByChannel() {
        return ResponseEntity.ok(analyticsService.getByChannel());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationRequest>> getLogs() {
        return ResponseEntity.ok(analyticsService.getRecentRequests());
    }

    @GetMapping("/logs/{requestId}")
    public ResponseEntity<List<NotificationLog>> getLogsForRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(analyticsService.getLogsForRequest(requestId));
    }
}
