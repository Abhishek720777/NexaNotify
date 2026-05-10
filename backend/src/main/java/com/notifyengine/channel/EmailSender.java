package com.notifyengine.channel;

import com.notifyengine.queue.NotificationJob;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailSender {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String mailUsername;

    public boolean send(NotificationJob job) {
        // MOCK MODE for testing
        if ("test".equals(mailUsername)) {
            log.info("--- MOCK EMAIL START ---");
            log.info("To: {}, Subject: {}", job.getTo(), job.getSubject());
            log.info("Body: {}", job.getBody());
            if (job.getAttachmentPath() != null) log.info("Attachment: {}", job.getAttachmentName());
            log.info("--- MOCK EMAIL END ---");
            return true;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(job.getTo());
            helper.setSubject(job.getSubject());
            helper.setText(job.getBody(), true); 

            // Handle Attachment
            if (job.getAttachmentPath() != null) {
                java.io.File file = new java.io.File(job.getAttachmentPath());
                if (file.exists()) {
                    helper.addAttachment(job.getAttachmentName() != null ? job.getAttachmentName() : file.getName(), file);
                }
            }
            
            mailSender.send(message);
            log.info("Email sent successfully to {}", job.getTo());
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", job.getTo(), e.getMessage());
            return false;
        }
    }
}
