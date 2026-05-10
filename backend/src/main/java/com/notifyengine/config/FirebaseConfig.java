package com.notifyengine.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.credentials-path:mock}")
    private String credentialsPath;

    @PostConstruct
    public void initialize() {
        if ("mock".equalsIgnoreCase(credentialsPath) || credentialsPath == null || credentialsPath.isEmpty()) {
            log.warn("Firebase credentials path is set to mock. Push notifications will be mocked.");
            return;
        }

        try {
            FileInputStream serviceAccount = new FileInputStream(credentialsPath);
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase application has been initialized");
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase with path {}. Push will be mocked. Error: {}", credentialsPath, e.getMessage());
        }
    }
}
