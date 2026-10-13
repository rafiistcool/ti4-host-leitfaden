package de.ti4.hub.game;

import org.springframework.data.jpa.repository.JpaRepository;

import de.ti4.hub.player.Player;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    long countByPlayer(Player player);
}
