package com.notifyengine.analytics;

import com.notifyengine.client.Client;
import com.notifyengine.notification.NotificationLog;
import com.notifyengine.notification.NotificationLogRepository;
import com.notifyengine.notification.NotificationRequest;
import com.notifyengine.notification.NotificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    public Map<String, Object> getSummary(LocalDate date) {
        if (date == null) date = LocalDate.now();
        Client client = getCurrentClient();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        long sent = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtBetween(client.getId(), "SENT", start, end);
        long failed = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtBetween(client.getId(), "DEAD", start, end) +
                      requestRepository.countByClientIdAndStatusAndCreatedAtBetween(client.getId(), "FAILED", start, end);
        long pending = logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtBetween(client.getId(), "PENDING", start, end) +
                       logRepository.countByRequest_ClientIdAndStatusAndLastAttemptedAtBetween(client.getId(), "RETRYING", start, end);
        
        long totalRequests = requestRepository.countByClientIdAndCreatedAtBetween(client.getId(), start, end);

        Map<String, Object> summary = new HashMap<>();
        summary.put("sentToday", sent);
        summary.put("failedToday", failed);
        summary.put("pendingToday", pending);
        summary.put("totalRequestsToday", totalRequests);
        return summary;
    }

    public Map<String, Object> getByChannel(LocalDate date) {
        if (date == null) date = LocalDate.now();
        Client client = getCurrentClient();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        long email = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtBetween(client.getId(), "EMAIL", start, end);
        long sms = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtBetween(client.getId(), "SMS", start, end);
        long push = logRepository.countByRequest_ClientIdAndChannelAndLastAttemptedAtBetween(client.getId(), "PUSH", start, end);

        Map<String, Object> byChannel = new HashMap<>();
        byChannel.put("EMAIL", email);
        byChannel.put("SMS", sms);
        byChannel.put("PUSH", push);
        return byChannel;
    }

    public Page<NotificationRequest> getRecentRequests(LocalDate date, Pageable pageable) {
        if (date == null) date = LocalDate.now();
        Client client = getCurrentClient();
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return requestRepository.findByClientIdAndCreatedAtBetweenOrderByCreatedAtDesc(client.getId(), start, end, pageable);
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
