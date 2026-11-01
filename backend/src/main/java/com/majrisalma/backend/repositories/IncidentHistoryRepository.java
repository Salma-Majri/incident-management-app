package com.majrisalma.backend.repositories;

import com.majrisalma.backend.entities.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}