package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.Incident;
import com.majrisalma.backend.entities.Status;
import com.majrisalma.backend.services.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // POST /api/incidents -> EMPLOYEE
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Incident> createIncident(
            @RequestBody Incident incident,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.createIncident(incident, userDetails.getUsername()));
    }

    // GET /api/incidents/my -> EMPLOYEE
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<Incident>> getMyIncidents(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.getIncidentsForUser(userDetails.getUsername()));
    }

    // GET /api/incidents/assigned -> TECHNICIAN
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<Incident>> getAssignedIncidents(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.getAssignedIncidentsForTechnician(userDetails.getUsername()));
    }

    // GET /api/incidents/{id} -> Selon propriétaire ou rôle
    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.getIncidentById(id, userDetails.getUsername()));
    }

    // GET /api/incidents -> ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Incident>> getAllIncidentsForAdmin() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    // PUT /api/incidents/{id}/assign/{technicianId} -> ADMIN
    @PutMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incident> assignIncident(
            @PathVariable Long id,
            @PathVariable Long technicianId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.assignIncident(id, technicianId, userDetails.getUsername()));
    }

    // PUT /api/incidents/{id}/status -> TECHNICIAN ou ADMIN
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.updateStatus(id, status, userDetails.getUsername()));
    }
}