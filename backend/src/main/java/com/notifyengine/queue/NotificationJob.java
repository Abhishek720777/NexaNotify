package com.notifyengine.queue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationJob implements Serializable {
    private Long logId;
    private String channel; // EMAIL, SMS, PUSH
    private String to;
    private String subject; // For email
    private String body;
    private int attemptCount;
    private String priority; // HIGH, LOW
}
