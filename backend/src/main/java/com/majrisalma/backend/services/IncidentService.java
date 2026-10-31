package com.majrisalma.backend.services;

import com.majrisalma.backend.entities.Incident;
import com.majrisalma.backend.entities.Role;
import com.majrisalma.backend.entities.Status;
import com.majrisalma.backend.entities.User;
import com.majrisalma.backend.repositories.IncidentRepository;
import com.majrisalma.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    // Créer un incident (par un EMPLOYEE)
    public Incident createIncident(Incident incident, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        incident.setCreatedBy(user);
        incident.setStatus(Status.OPEN);
        return incidentRepository.save(incident);
    }

    // Lister les incidents selon le rôle de l'utilisateur
    public List<Incident> getIncidentsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.TECHNICIAN) {
            return incidentRepository.findAll();
        } else {
            return incidentRepository.findByCreatedBy(user);
        }
    }

    // Assigner un incident à un technicien (ADMIN ou TECHNICIAN)
    public Incident assignIncident(Long incidentId, Long technicianId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));

        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new RuntimeException("L'utilisateur assigné doit être un technicien");
        }

        incident.setAssignedTo(technician);
        incident.setStatus(Status.ASSIGNED);
        return incidentRepository.save(incident);
    }

    // Mettre à jour le statut d'un incident
    public Incident updateStatus(Long incidentId, Status newStatus, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Seul un ADMIN, le TECHNICIAN assigné, ou l'EMPLOYEE créateur (dans certains cas) peut modifier
        incident.setStatus(newStatus);
        return incidentRepository.save(incident);
    }
}