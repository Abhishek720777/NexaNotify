package com.notifyengine.auth;

import com.notifyengine.client.Client;
import com.notifyengine.client.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public Map<String, String> signup(Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");

        if (clientRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Client client = Client.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .isActive(true)
                .build();

        clientRepository.save(client);

        String token = jwtUtil.generateToken(client);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("apiKey", client.getApiKey());
        return response;
    }

    public Map<String, String> login(Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        Client client = clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        String token = jwtUtil.generateToken(client);

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("apiKey", client.getApiKey());
        return response;
    }
}
