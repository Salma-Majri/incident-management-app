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

    public Incident createIncident(Incident incident, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        incident.setCreatedBy(user);
        incident.setStatus(Status.OPEN);
        return incidentRepository.save(incident);
    }

    public List<Incident> getIncidentsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return incidentRepository.findByCreatedBy(user);
    }

    public List<Incident> getAssignedIncidentsForTechnician(String userEmail) {
        User technician = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
        return incidentRepository.findByAssignedTo(technician);
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Long incidentId, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Vérification des accès : Admin, Tech assigné, ou créateur de l'incident[cite: 3]
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isCreator = incident.getCreatedBy().equals(user);
        boolean isAssignedTech = incident.getAssignedTo() != null && incident.getAssignedTo().equals(user);

        if (!isAdmin && !isCreator && !isAssignedTech) {
            throw new RuntimeException("Accès refusé à cet incident");
        }

        return incident;
    }

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

    public Incident updateStatus(Long incidentId, Status newStatus, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        incident.setStatus(newStatus);
        return incidentRepository.save(incident);
    }
}