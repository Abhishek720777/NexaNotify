package com.notifyengine.template;

import com.notifyengine.client.Client;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateCacheService templateCacheService;

    private Client getCurrentClient() {
        return (Client) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Template createTemplate(Template template) {
        Client client = getCurrentClient();
        template.setClient(client);
        Template saved = templateRepository.save(template);
        templateCacheService.evictActiveTemplates(client.getId(), template.getEventName());
        return saved;
    }

    public List<Template> getAllTemplates() {
        Client client = getCurrentClient();
        return templateRepository.findByClientIdAndIsActiveTrue(client.getId());
    }

    @Transactional
    public Template updateTemplate(Long id, Template templateDetails) {
        Client client = getCurrentClient();
        Template oldTemplate = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!oldTemplate.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Mark old as inactive
        oldTemplate.setActive(false);
        templateRepository.save(oldTemplate);

        // Create new version
        Template newTemplate = new Template();
        newTemplate.setClient(client);
        newTemplate.setEventName(templateDetails.getEventName());
        newTemplate.setChannel(templateDetails.getChannel());
        newTemplate.setSubject(templateDetails.getSubject());
        newTemplate.setBody(templateDetails.getBody());
        newTemplate.setActive(templateDetails.isActive());
        newTemplate.setLogoUrl(templateDetails.getLogoUrl());
        newTemplate.setPrimaryColor(templateDetails.getPrimaryColor());
        newTemplate.setVersion(oldTemplate.getVersion() + 1);

        Template saved = templateRepository.save(newTemplate);

        // Evict caches
        templateCacheService.evictActiveTemplates(client.getId(), oldTemplate.getEventName());
        if (!oldTemplate.getEventName().equalsIgnoreCase(newTemplate.getEventName())) {
            templateCacheService.evictActiveTemplates(client.getId(), newTemplate.getEventName());
        }

        return saved;
    }

    @Transactional
    public void deleteTemplate(Long id) {
        Client client = getCurrentClient();
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        template.setActive(false);
        templateRepository.save(template);

        templateCacheService.evictActiveTemplates(client.getId(), template.getEventName());
    }
}
