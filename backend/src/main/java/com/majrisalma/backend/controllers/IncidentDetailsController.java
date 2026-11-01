package com.majrisalma.backend.controllers;

import com.majrisalma.backend.entities.IncidentComment;
import com.majrisalma.backend.entities.IncidentHistory;
import com.majrisalma.backend.repositories.IncidentCommentRepository;
import com.majrisalma.backend.repositories.IncidentHistoryRepository;
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
public class IncidentDetailsController {

    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final IncidentService incidentService;

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(historyRepository.findByIncidentIdOrderByCreatedAtDesc(id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<IncidentComment>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentRepository.findByIncidentIdOrderByCreatedAtAsc(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentComment> addComment(
            @PathVariable Long id,
            @RequestBody IncidentComment commentRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        IncidentComment savedComment = incidentService.addComment(id, commentRequest.getContent(), userDetails.getUsername());
        return ResponseEntity.ok(savedComment);
    }
}