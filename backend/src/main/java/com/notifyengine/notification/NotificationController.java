package com.notifyengine.notification;

import com.notifyengine.client.Client;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/notify")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<String> notify(@RequestBody Map<String, Object> payload) {
        Client client = (Client) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        CompletableFuture.runAsync(() -> {
            try {
                notificationService.processNotificationRequest(client, payload);
            } catch (Exception e) {
                log.error("Async notification processing failed for client {}: {}", client.getId(), e.getMessage(), e);
            }
        });

        return ResponseEntity.accepted().body("Notification request accepted");
    }
}
