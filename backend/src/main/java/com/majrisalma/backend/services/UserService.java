package com.majrisalma.backend.services;

import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    public User updateProfile(String email, User updatedDetails) {
        User user = getUserByEmail(email);

        if (updatedDetails.getFullName() != null) {
            user.setFullName(updatedDetails.getFullName());
        }

        if (updatedDetails.getPassword() != null && !updatedDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedDetails.getPassword()));
        }

        return userRepository.save(user);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User enableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public User disableUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setEnabled(false);
        return userRepository.save(user);
    }
}