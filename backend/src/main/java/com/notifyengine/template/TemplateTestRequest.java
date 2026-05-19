package com.notifyengine.template;

import lombok.Data;
import java.util.Map;

@Data
public class TemplateTestRequest {
    private String channel;
    private String to;
    private String subject;
    private String body;
    private Map<String, Object> mockData;
}
