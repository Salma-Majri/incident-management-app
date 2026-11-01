package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // PUT /api/admin/users/{id}/enable
    @PutMapping("/users/{id}/enable")
    public ResponseEntity<User> enableUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.enableUser(id));
    }

    // PUT /api/admin/users/{id}/disable
    @PutMapping("/users/{id}/disable")
    public ResponseEntity<User> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.disableUser(id));
    }

    // GET /api/admin/statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }
}