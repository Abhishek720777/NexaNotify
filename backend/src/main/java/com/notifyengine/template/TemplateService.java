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

    private Client getCurrentClient() {
        return (Client) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Template createTemplate(Template template) {
        Client client = getCurrentClient();
        template.setClient(client);
        return templateRepository.save(template);
    }

    public List<Template> getAllTemplates() {
        Client client = getCurrentClient();
        return templateRepository.findByClientId(client.getId());
    }

    @Transactional
    public Template updateTemplate(Long id, Template templateDetails) {
        Client client = getCurrentClient();
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        template.setEventName(templateDetails.getEventName());
        template.setChannel(templateDetails.getChannel());
        template.setSubject(templateDetails.getSubject());
        template.setBody(templateDetails.getBody());
        template.setActive(templateDetails.isActive());
        template.setLogoUrl(templateDetails.getLogoUrl());
        template.setPrimaryColor(templateDetails.getPrimaryColor());

        return templateRepository.save(template);
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
    }
}
