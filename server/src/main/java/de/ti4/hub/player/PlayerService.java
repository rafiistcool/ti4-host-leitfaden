package de.ti4.hub.player;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.ti4.hub.ConflictException;
import de.ti4.hub.NotFoundException;
import de.ti4.hub.game.ParticipantRepository;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository players;
    private final ParticipantRepository participants;

    PlayerService(PlayerRepository players, ParticipantRepository participants) {
        this.players = players;
        this.participants = participants;
    }

    @Transactional(readOnly = true)
    public List<PlayerDto> list() {
        return players.findAllByOrderByNameAsc().stream().map(PlayerDto::of).toList();
    }

    public PlayerDto create(PlayerRequest req) {
        String name = req.name().strip();
        if (players.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Es gibt schon einen Spieler namens „" + name + "“.");
        }
        return PlayerDto.of(players.save(new Player(name)));
    }

    public PlayerDto rename(Long id, PlayerRequest req) {
        Player p = get(id);
        String name = req.name().strip();
        if (players.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Es gibt schon einen Spieler namens „" + name + "“.");
        }
        p.setName(name);
        return PlayerDto.of(p);
    }

    public void delete(Long id) {
        Player p = get(id);
        long games = participants.countByPlayer(p);
        if (games > 0) {
            throw new ConflictException(p.getName() + " ist in " + games + (games == 1 ? " Spiel" : " Spielen")
                    + " eingetragen und kann darum nicht gelöscht werden. Umbenennen geht.");
        }
        players.delete(p);
    }

    public Player get(Long id) {
        return players.findById(id).orElseThrow(() -> new NotFoundException("Spieler " + id + " gibt es nicht."));
    }
}
