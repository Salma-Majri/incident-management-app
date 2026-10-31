package com.majrisalma.backend.repositories;

import com.majrisalma.backend.entities.Incident;
import com.majrisalma.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByCreatedBy(User createdBy);
    List<Incident> findByAssignedTo(User assignedTo);
}