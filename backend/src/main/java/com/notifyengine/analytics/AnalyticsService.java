package com.notifyengine.analytics;

import com.notifyengine.client.Client;
import com.notifyengine.notification.NotificationLog;
import com.notifyengine.notification.NotificationLogRepository;
import com.notifyengine.notification.NotificationRequest;
import com.notifyengine.notification.NotificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final NotificationLogRepository logRepository;
    private final NotificationRequestRepository requestRepository;

    private Client getCurrentClient() {
        return (Client) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Map<String, Object> getSummary() {
        Client client = getCurrentClient();
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        long sent = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtAfter(client.getId(), "SENT", todayStart);
        long failed = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtAfter(client.getId(), "DEAD", todayStart) +
                      requestRepository.countByClientIdAndStatusAndCreatedAtAfter(client.getId(), "FAILED", todayStart);
        long pending = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtAfter(client.getId(), "PENDING", todayStart) +
                       logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtAfter(client.getId(), "RETRYING", todayStart);
        
        long totalRequests = requestRepository.countByClientIdAndCreatedAtAfter(client.getId(), todayStart);

        Map<String, Object> summary = new HashMap<>();
        summary.put("sentToday", sent);
        summary.put("failedToday", failed);
        summary.put("pendingToday", pending);
        summary.put("totalRequestsToday", totalRequests);
        return summary;
    }

    public Map<String, Object> getByChannel() {
        Client client = getCurrentClient();
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        long email = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtAfter(client.getId(), "EMAIL", todayStart);
        long sms = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtAfter(client.getId(), "SMS", todayStart);
        long push = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtAfter(client.getId(), "PUSH", todayStart);

        Map<String, Object> byChannel = new HashMap<>();
        byChannel.put("EMAIL", email);
        byChannel.put("SMS", sms);
        byChannel.put("PUSH", push);
        return byChannel;
    }

    public List<NotificationRequest> getRecentRequests() {
        Client client = getCurrentClient();
        return requestRepository.findByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .limit(50) // Just return latest 50 for logs page
                .toList();
    }

    public List<NotificationLog> getLogsForRequest(Long requestId) {
        Client client = getCurrentClient();
        NotificationRequest req = requestRepository.findById(requestId).orElse(null);
        if (req == null || !req.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Request not found or unauthorized");
        }
        return logRepository.findByRequestId(requestId);
    }
}
