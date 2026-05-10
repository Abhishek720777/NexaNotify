package com.notifyengine.channel;

import com.notifyengine.queue.NotificationJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PushSender {

    private boolean isMocked = true; // Default to mocked since we don't have a valid firebase json path usually.

    public boolean send(NotificationJob job) {
        try {
            if (isMocked) {
                log.info("[MOCK PUSH] Sent to FCM token {}: {}", job.getTo(), job.getBody());
                return true;
            }
            
            // In a real scenario, use FirebaseMessaging.getInstance().send(message) here.
            return true;
        } catch (Exception e) {
            log.error("Failed to send PUSH to {}: {}", job.getTo(), e.getMessage());
            return false;
        }
    }
}
