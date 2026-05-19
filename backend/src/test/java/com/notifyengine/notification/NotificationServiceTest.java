package com.notifyengine.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notifyengine.client.Client;
import com.notifyengine.queue.NotificationJob;
import com.notifyengine.queue.RedisQueueService;
import com.notifyengine.ratelimit.RateLimiter;
import com.notifyengine.template.Template;
import com.notifyengine.template.TemplateCacheService;
import com.notifyengine.user.NotificationUser;
import com.notifyengine.user.UserPreference;
import com.notifyengine.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRequestRepository requestRepository;

    @Mock
    private NotificationLogRepository logRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisQueueService queueService;

    @Mock
    private RateLimiter rateLimiter;

    @Mock
    private TemplateCacheService templateCacheService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationService notificationService;

    private Client client;
    private NotificationUser user;
    private Map<String, Object> payload;

    @BeforeEach
    public void setUp() {
        client = new Client();
        client.setId(1L);
        client.setApiKey("test-api-key");
        client.setName("TestClient");
        client.setLogoUrl("http://logo.com");
        client.setPrimaryColor("#ffffff");

        user = new NotificationUser();
        user.setId(1L);
        user.setExternalUserId("user_101");
        user.setEmail("user@example.com");
        user.setPhone("+123456789");
        user.setPreferences(new ArrayList<>());

        payload = new HashMap<>();
        payload.put("userId", "user_101");
        payload.put("event", "USER_WELCOME");
        payload.put("data", new HashMap<String, Object>());
        payload.put("priority", "HIGH");

        lenient().when(requestRepository.save(any(NotificationRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    public void testProcessNotificationRequest_Success() throws Exception {
        // Arrange
        when(rateLimiter.isAllowed(anyString())).thenReturn(true);
        when(userRepository.findByClientIdAndExternalUserId(anyLong(), anyString())).thenReturn(Optional.of(user));
        
        Template template = new Template();
        template.setId(1L);
        template.setChannel("EMAIL");
        template.setSubject("Welcome ${name}!");
        template.setBody("Hello ${name}, welcome to ${clientName}!");
        template.setActive(true);
        
        when(templateCacheService.getActiveTemplates(anyLong(), anyString())).thenReturn(Collections.singletonList(template));
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        NotificationLog mockLog = new NotificationLog();
        mockLog.setId(10L);
        when(logRepository.save(any(NotificationLog.class))).thenReturn(mockLog);

        Map<String, Object> innerData = new HashMap<>();
        innerData.put("name", "John");
        payload.put("data", innerData);

        // Act
        notificationService.processNotificationRequest(client, payload);

        // Assert
        verify(queueService, times(1)).pushJob(any(NotificationJob.class));
        
        ArgumentCaptor<NotificationJob> jobCaptor = ArgumentCaptor.forClass(NotificationJob.class);
        verify(queueService).pushJob(jobCaptor.capture());
        
        NotificationJob pushedJob = jobCaptor.getValue();
        assertEquals("EMAIL", pushedJob.getChannel());
        assertEquals("user@example.com", pushedJob.getTo());
        assertEquals("Welcome John!", pushedJob.getSubject());
        assertEquals("Hello John, welcome to TestClient!", pushedJob.getBody());
        assertEquals("HIGH", pushedJob.getPriority());

        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(requestRepository, atLeastOnce()).save(requestCaptor.capture());
        
        NotificationRequest savedRequest = requestCaptor.getValue();
        assertEquals("QUEUED", savedRequest.getStatus());
    }

    @Test
    public void testProcessNotificationRequest_RateLimitExceeded() {
        // Arrange
        when(rateLimiter.isAllowed(anyString())).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.processNotificationRequest(client, payload);
        });
        assertEquals("Rate limit exceeded", exception.getMessage());
        verifyNoInteractions(userRepository, templateCacheService, queueService);
    }

    @Test
    public void testProcessNotificationRequest_UserNotFound() throws Exception {
        // Arrange
        when(rateLimiter.isAllowed(anyString())).thenReturn(true);
        when(userRepository.findByClientIdAndExternalUserId(anyLong(), anyString())).thenReturn(Optional.empty());
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        // Act
        notificationService.processNotificationRequest(client, payload);

        // Assert
        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(requestRepository, atLeastOnce()).save(requestCaptor.capture());
        
        NotificationRequest savedRequest = requestCaptor.getValue();
        assertEquals("FAILED", savedRequest.getStatus());
        verifyNoInteractions(templateCacheService, queueService);
    }

    @Test
    public void testProcessNotificationRequest_SuppressedDuringQuietHours() throws Exception {
        // Arrange
        when(rateLimiter.isAllowed(anyString())).thenReturn(true);
        when(userRepository.findByClientIdAndExternalUserId(anyLong(), anyString())).thenReturn(Optional.of(user));
        
        // Add User Preference with Active Quiet Hours
        UserPreference preference = new UserPreference();
        preference.setChannel("EMAIL");
        preference.setEnabled(true);
        preference.setQuietHoursStart(LocalTime.now().minusHours(1)); // current hour falls in quiet hours
        preference.setQuietHoursEnd(LocalTime.now().plusHours(1));
        user.getPreferences().add(preference);

        Template template = new Template();
        template.setId(1L);
        template.setChannel("EMAIL");
        template.setActive(true);
        
        when(templateCacheService.getActiveTemplates(anyLong(), anyString())).thenReturn(Collections.singletonList(template));
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        payload.put("priority", "LOW"); // quiet hours are respected on LOW priority requests

        // Act
        notificationService.processNotificationRequest(client, payload);

        // Assert
        ArgumentCaptor<NotificationRequest> requestCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(requestRepository, atLeastOnce()).save(requestCaptor.capture());
        
        NotificationRequest savedRequest = requestCaptor.getValue();
        assertEquals("SUPPRESSED", savedRequest.getStatus());
        verifyNoInteractions(queueService); // verified no job is dispatched to Redis queue!
    }
}
