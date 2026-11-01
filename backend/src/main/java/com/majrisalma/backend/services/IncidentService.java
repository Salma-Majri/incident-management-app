package com.majrisalma.backend.services;

import com.majrisalma.backend.entities.*;
import com.majrisalma.backend.repositories.IncidentCommentRepository;
import com.majrisalma.backend.repositories.IncidentHistoryRepository;
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
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;

    public Incident createIncident(Incident incident, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        incident.setCreatedBy(user);
        incident.setStatus(Status.OPEN);
        Incident savedIncident = incidentRepository.save(incident);

        recordHistory(savedIncident, "Création de l'incident avec le statut OPEN", user);

        return savedIncident;
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

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isCreator = incident.getCreatedBy().equals(user);
        boolean isAssignedTech = incident.getAssignedTo() != null && incident.getAssignedTo().equals(user);

        if (!isAdmin && !isCreator && !isAssignedTech) {
            throw new RuntimeException("Accès refusé à cet incident");
        }

        return incident;
    }

    public Incident assignIncident(Long incidentId, Long technicianId, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));

        User adminUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (technician.getRole() != Role.TECHNICIAN && technician.getRole() != Role.ADMIN) {
            throw new RuntimeException("L'utilisateur assigné doit être un technicien");
        }

        incident.setAssignedTo(technician);
        incident.setStatus(Status.ASSIGNED);
        Incident updatedIncident = incidentRepository.save(incident);

        recordHistory(updatedIncident, "Assigné à " + technician.getFullName() + " (Statut: ASSIGNED)", adminUser);

        return updatedIncident;
    }

    public Incident updateStatus(Long incidentId, Status newStatus, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Status oldStatus = incident.getStatus();
        incident.setStatus(newStatus);
        Incident updatedIncident = incidentRepository.save(incident);

        recordHistory(updatedIncident, "Statut modifié de " + oldStatus + " à " + newStatus, user);

        return updatedIncident;
    }

    public IncidentComment addComment(Long incidentId, String content, String userEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident introuvable"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        IncidentComment comment = new IncidentComment();
        comment.setIncident(incident);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    private void recordHistory(Incident incident, String description, User user) {
        IncidentHistory history = new IncidentHistory();
        history.setIncident(incident);
        history.setDescription(description);
        history.setChangedBy(user);
        historyRepository.save(history);
    }
}