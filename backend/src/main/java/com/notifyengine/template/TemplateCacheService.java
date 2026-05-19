package com.notifyengine.template;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateCacheService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final TemplateRepository templateRepository;

    private String getCacheKey(Long clientId, String eventName) {
        return "templates:" + clientId + ":" + eventName.toLowerCase().trim();
    }

    @SuppressWarnings("unchecked")
    public List<Template> getActiveTemplates(Long clientId, String eventName) {
        String key = getCacheKey(clientId, eventName);
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached instanceof List) {
                log.info("Cache hit for templates key: {}", key);
                List<?> list = (List<?>) cached;
                List<Template> templates = new ArrayList<>();
                for (Object item : list) {
                    // Jackson deserializer returns LinkedHashMap if type info isn't resolved completely
                    // but GenericJackson2JsonRedisSerializer serializes class names, or Jackson converts it to Template.
                    // To be absolutely robust, we can handle both.
                    if (item instanceof Template) {
                        templates.add((Template) item);
                    } else if (item instanceof java.util.Map) {
                        // fallback helper mapping
                        try {
                            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
                            Template t = mapper.convertValue(item, Template.class);
                            templates.add(t);
                        } catch (Exception ex) {
                            log.error("Failed to convert cached Map to Template", ex);
                        }
                    }
                }
                return templates;
            }
        } catch (Exception e) {
            log.error("Failed to read templates from Redis cache", e);
        }

        log.info("Cache miss for templates key: {}. Fetching from DB.", key);
        List<Template> templates = templateRepository.findByClientIdAndEventNameAndIsActiveTrue(clientId, eventName);
        try {
            redisTemplate.opsForValue().set(key, templates, 1, TimeUnit.HOURS);
            log.info("Successfully cached templates key: {}", key);
        } catch (Exception e) {
            log.error("Failed to write templates to Redis cache", e);
        }
        return templates;
    }

    public void evictActiveTemplates(Long clientId, String eventName) {
        if (clientId != null && eventName != null) {
            String key = getCacheKey(clientId, eventName);
            try {
                redisTemplate.delete(key);
                log.info("Evicted templates from cache for key: {}", key);
            } catch (Exception e) {
                log.error("Failed to evict templates from cache for key: {}", key, e);
            }
        }
    }
}
