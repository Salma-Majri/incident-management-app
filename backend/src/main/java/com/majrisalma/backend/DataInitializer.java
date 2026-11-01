package com.majrisalma.backend;

import com.majrisalma.backend.entities.*;
import com.majrisalma.backend.repositories.IncidentCommentRepository;
import com.majrisalma.backend.repositories.IncidentHistoryRepository;
import com.majrisalma.backend.repositories.IncidentRepository;
import com.majrisalma.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final IncidentCommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setFullName("Admin System");
                admin.setEmail("admin@ims.com");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                userRepository.save(admin);

                User technician = new User();
                technician.setFullName("Technicien Ali");
                technician.setEmail("tech@ims.com");
                technician.setPassword(passwordEncoder.encode("123456"));
                technician.setRole(Role.TECHNICIAN);
                technician.setEnabled(true);
                userRepository.save(technician);

                User employee1 = new User();
                employee1.setFullName("Employee Salma");
                employee1.setEmail("salma@ims.com");
                employee1.setPassword(passwordEncoder.encode("123456"));
                employee1.setRole(Role.EMPLOYEE);
                employee1.setEnabled(true);
                userRepository.save(employee1);

                User employee2 = new User();
                employee2.setFullName("Employee Mohammed");
                employee2.setEmail("mohammed@ims.com");
                employee2.setPassword(passwordEncoder.encode("123456"));
                employee2.setRole(Role.EMPLOYEE);
                employee2.setEnabled(false);
                userRepository.save(employee2);

                Incident incident1 = new Incident();
                incident1.setTitle("Panne réseau bureau 3");
                incident1.setDescription("La connexion internet est coupée depuis ce matin.");
                incident1.setStatus(Status.ASSIGNED);
                incident1.setCategory(Category.valueOf("NETWORK"));
                incident1.setPriority(Priority.valueOf("HIGH"));
                incident1.setCreatedBy(employee1);
                incident1.setAssignedTo(technician);
                incidentRepository.save(incident1);

                Incident incident2 = new Incident();
                incident2.setTitle("Problème Imprimante");
                incident2.setDescription("L'imprimante du 2ème étage ne répond plus.");
                incident2.setStatus(Status.IN_PROGRESS);
                incident2.setCategory(Category.valueOf("HARDWARE"));
                incident2.setPriority(Priority.valueOf("MEDIUM"));
                incident2.setCreatedBy(employee1);
                incident2.setAssignedTo(technician);
                incidentRepository.save(incident2);

                IncidentHistory history1 = new IncidentHistory();
                history1.setIncident(incident1);
                history1.setDescription("Création de l'incident avec le statut OPEN");
                history1.setChangedBy(employee1);
                history1.setCreatedAt(LocalDateTime.now().minusHours(2));
                historyRepository.save(history1);

                IncidentHistory history2 = new IncidentHistory();
                history2.setIncident(incident1);
                history2.setDescription("Assigné à Technicien Ali (Statut: ASSIGNED)");
                history2.setChangedBy(admin);
                history2.setCreatedAt(LocalDateTime.now().minusHours(1));
                historyRepository.save(history2);

                IncidentComment comment1 = new IncidentComment();
                comment1.setIncident(incident1);
                comment1.setUser(employee1);
                comment1.setContent("Est-ce qu'il y a du nouveau concernant cette panne ?");
                comment1.setCreatedAt(LocalDateTime.now().minusMinutes(45));
                commentRepository.save(comment1);

                IncidentComment comment2 = new IncidentComment();
                comment2.setIncident(incident1);
                comment2.setUser(technician);
                comment2.setContent("Oui, je suis en train de vérifier le switch principal du bureau.");
                comment2.setCreatedAt(LocalDateTime.now().minusMinutes(20));
                commentRepository.save(comment2);

                System.out.println("Données initiales, historique et commentaires chargés avec succès !");
            }
        };
    }
}