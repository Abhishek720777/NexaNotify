package com.notifyengine.channel;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.notifyengine.queue.NotificationJob;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PushSender {

    public boolean send(NotificationJob job) {
        try {
            // If Firebase is not initialized, fallback to Mock Mode
            if (FirebaseApp.getApps().isEmpty()) {
                log.info("[MOCK PUSH] Sent to FCM token {}: Subject: '{}', Body: '{}'", job.getTo(), job.getSubject(), job.getBody());
                return true;
            }
            
            Notification notification = Notification.builder()
                    .setTitle(job.getSubject())
                    .setBody(job.getBody())
                    .build();

            Message message = Message.builder()
                    .setToken(job.getTo()) // The user's device FCM token
                    .setNotification(notification)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("PUSH sent successfully to {}, Message ID: {}", job.getTo(), response);
            return true;
        } catch (Exception e) {
            log.error("Failed to send PUSH to {}: {}", job.getTo(), e.getMessage());
            return false;
        }
    }
}
