package com.notifyengine.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<NotificationUser> registerUser(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @GetMapping("/{externalUserId}")
    public ResponseEntity<NotificationUser> getUser(@PathVariable String externalUserId) {
        return ResponseEntity.ok(userService.getUser(externalUserId));
    }

    @PutMapping("/{externalUserId}/preferences")
    public ResponseEntity<UserPreference> updatePreference(
            @PathVariable String externalUserId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(userService.updatePreference(externalUserId, request));
    }
}
