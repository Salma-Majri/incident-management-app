package com.majrisalma.backend.repositories;

import com.majrisalma.backend.entities.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentCommentRepository extends JpaRepository<IncidentComment, Long> {
    List<IncidentComment> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}