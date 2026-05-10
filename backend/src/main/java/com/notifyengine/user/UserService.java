package com.notifyengine.user;

import com.notifyengine.client.Client;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    private Client getCurrentClient() {
        return (Client) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Transactional
    public NotificationUser registerUser(Map<String, String> request) {
        Client client = getCurrentClient();
        String externalUserId = request.get("externalUserId");

        NotificationUser user = userRepository.findByClientIdAndExternalUserId(client.getId(), externalUserId)
                .orElse(NotificationUser.builder()
                        .client(client)
                        .externalUserId(externalUserId)
                        .build());

        user.setEmail(request.get("email"));
        user.setPhone(request.get("phone"));
        user.setFcmToken(request.get("fcmToken"));

        return userRepository.save(user);
    }

    public NotificationUser getUser(String externalUserId) {
        Client client = getCurrentClient();
        return userRepository.findByClientIdAndExternalUserId(client.getId(), externalUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserPreference updatePreference(String externalUserId, Map<String, Object> request) {
        NotificationUser user = getUser(externalUserId);
        String channel = (String) request.get("channel");
        
        List<UserPreference> prefs = userPreferenceRepository.findByUserId(user.getId());
        UserPreference pref = prefs.stream()
                .filter(p -> p.getChannel().equalsIgnoreCase(channel))
                .findFirst()
                .orElse(UserPreference.builder()
                        .user(user)
                        .channel(channel.toUpperCase())
                        .build());

        if (request.containsKey("isEnabled")) {
            pref.setEnabled((Boolean) request.get("isEnabled"));
        }
        if (request.containsKey("quietHoursStart") && request.containsKey("quietHoursEnd")) {
            pref.setQuietHoursStart(LocalTime.parse((String) request.get("quietHoursStart")));
            pref.setQuietHoursEnd(LocalTime.parse((String) request.get("quietHoursEnd")));
        }

        return userPreferenceRepository.save(pref);
    }
}
