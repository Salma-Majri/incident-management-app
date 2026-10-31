package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.Incident;
import com.majrisalma.backend.entities.Status;
import com.majrisalma.backend.services.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<Incident> createIncident(
            @RequestBody Incident incident,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.createIncident(incident, userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getIncidents(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.getIncidentsForUser(userDetails.getUsername()));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(
            @PathVariable Long id,
            @RequestParam Long technicianId
    ) {
        return ResponseEntity.ok(incidentService.assignIncident(id, technicianId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(incidentService.updateStatus(id, status, userDetails.getUsername()));
    }
}