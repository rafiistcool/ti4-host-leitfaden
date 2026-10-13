package de.ti4.hub.game;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {

    @EntityGraph(attributePaths = {"participants", "participants.player"})
    List<Game> findAllByOrderByScheduledAtDesc();
}
