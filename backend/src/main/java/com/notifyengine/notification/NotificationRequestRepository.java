package com.notifyengine.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRequestRepository extends JpaRepository<NotificationRequest, Long> {
    List<NotificationRequest> findByClientIdOrderByCreatedAtDesc(Long clientId);
    long countByClientIdAndCreatedAtAfter(Long clientId, LocalDateTime createdAt);
}
