package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.services.UserService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
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







    @Setter
    @Getter
    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;

    }

    // PUT /api/profile/password
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PasswordChangeRequest request
    ) {
        try {
            userService.updatePassword(
                    userDetails.getUsername(),
                    request.getOldPassword(),
                    request.getNewPassword()
            );
            return ResponseEntity.ok().body("Mot de passe modifié avec succès !");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}