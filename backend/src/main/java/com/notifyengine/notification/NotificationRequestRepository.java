package com.notifyengine.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

@Repository
public interface NotificationRequestRepository extends JpaRepository<NotificationRequest, Long> {
    Page<NotificationRequest> findByClientIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long clientId, LocalDateTime start, LocalDateTime end, Pageable pageable);
    long countByClientIdAndCreatedAtBetween(Long clientId, LocalDateTime start, LocalDateTime end);
    long countByClientIdAndStatusAndCreatedAtBetween(Long clientId, String status, LocalDateTime start, LocalDateTime end);
}
