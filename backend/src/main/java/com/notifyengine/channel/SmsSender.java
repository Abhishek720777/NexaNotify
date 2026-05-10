package com.notifyengine.channel;

import com.notifyengine.queue.NotificationJob;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
@Slf4j
public class SmsSender {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    private boolean isMocked = false;

    @PostConstruct
    public void init() {
        if ("mock_sid".equals(accountSid) || accountSid == null || accountSid.isEmpty()) {
            log.warn("Twilio credentials not provided. SMS will be mocked.");
            isMocked = true;
        } else {
            Twilio.init(accountSid, authToken);
        }
    }

    public boolean send(NotificationJob job) {
        try {
            if (isMocked) {
                log.info("[MOCK SMS] Sent to {}: {}", job.getTo(), job.getBody());
                return true;
            }

            Message message = Message.creator(
                    new PhoneNumber(job.getTo()),
                    new PhoneNumber(fromNumber),
                    job.getBody()
            ).create();

            log.info("SMS sent successfully to {}, SID: {}", job.getTo(), message.getSid());
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", job.getTo(), e.getMessage());
            return false;
        }
    }
}
