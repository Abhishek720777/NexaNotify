package com.notifyengine.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {
    List<Template> findByClientId(Long clientId);
    List<Template> findByClientIdAndEventNameAndIsActiveTrue(Long clientId, String eventName);
}
