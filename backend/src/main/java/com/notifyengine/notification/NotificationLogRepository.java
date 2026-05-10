package com.notifyengine.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRequestId(Long requestId);
    long countByRequest_ClientIdAndStatusAndLastAttemptedAtAfter(Long clientId, String status, LocalDateTime date);
    long countByRequest_ClientIdAndChannelAndLastAttemptedAtAfter(Long clientId, String channel, LocalDateTime date);
}
