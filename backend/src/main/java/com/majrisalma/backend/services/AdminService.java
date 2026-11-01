package com.majrisalma.backend.services;

import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.repositories.IncidentRepository;
import com.majrisalma.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

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

    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalIncidents", incidentRepository.count());
        // تقدر تزيد إحصائيات أخرى حسب الرغبة (بحال عدد البلاغات المفتوحة، إلخ)
        return stats;
    }
}