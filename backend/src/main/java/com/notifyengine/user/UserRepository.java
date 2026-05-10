package com.notifyengine.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<NotificationUser, Long> {
    Optional<NotificationUser> findByClientIdAndExternalUserId(Long clientId, String externalUserId);
}
