package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    // GET /api/profile -> Authentifié
    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    // PUT /api/profile -> Authentifié
    @PutMapping
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody User updatedDetails
    ) {
        User updatedUser = userService.updateProfile(userDetails.getUsername(), updatedDetails);
        return ResponseEntity.ok(updatedUser);
    }
}