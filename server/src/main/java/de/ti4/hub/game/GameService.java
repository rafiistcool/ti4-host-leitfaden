package de.ti4.hub.game;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.ti4.hub.ConflictException;
import de.ti4.hub.NotFoundException;
import de.ti4.hub.player.Player;
import de.ti4.hub.player.PlayerService;

@Service
@Transactional
public class GameService {

    private final GameRepository games;
    private final PlayerService players;

    GameService(GameRepository games, PlayerService players) {
        this.games = games;
        this.players = players;
    }

    @Transactional(readOnly = true)
    public List<GameDto> list() {
        return games.findAllByOrderByScheduledAtDesc().stream().map(GameDto::of).toList();
    }

    @Transactional(readOnly = true)
    public GameDto find(Long id) {
        return GameDto.of(get(id));
    }

    public GameDto create(GameRequest req) {
        Game game = new Game();
        apply(game, req);
        return GameDto.of(games.saveAndFlush(game));
    }

    public GameDto update(Long id, GameRequest req) {
        Game game = get(id);
        if (req.version() != null && req.version() != game.getVersion()) {
            throw new ConflictException(
                    "Jemand anderes hat dieses Spiel gerade geändert. Die Seite lädt den neuen Stand, bitte nochmal speichern.");
        }
        apply(game, req);
        game.touch();
        return GameDto.of(games.saveAndFlush(game));
    }

    public void delete(Long id) {
        games.delete(get(id));
    }

    private Game get(Long id) {
        return games.findById(id).orElseThrow(() -> new NotFoundException("Spiel " + id + " gibt es nicht."));
    }

    private void apply(Game game, GameRequest req) {
        game.setScheduledAt(req.scheduledAt());
        game.setLocation(blankToNull(req.location()));
        game.setStatus(req.status());
        game.setPointsToWin(req.pointsToWin() == null ? 10 : req.pointsToWin());
        game.setNotes(blankToNull(req.notes()));

        List<ParticipantDto> wanted = req.participants() == null ? List.of() : req.participants();
        checkUnique(wanted);
        if (req.status() == GameStatus.FINISHED) {
            wanted = withPlacements(wanted);
        }
        mergeParticipants(game, wanted);
    }

    /** Vorhandene Einträge werden aktualisiert statt gelöscht und neu angelegt. */
    private void mergeParticipants(Game game, List<ParticipantDto> wanted) {
        Map<Long, Participant> existing = game.getParticipants().stream()
                .collect(Collectors.toMap(p -> p.getPlayer().getId(), Function.identity()));
        List<Participant> next = new ArrayList<>();
        for (int seat = 0; seat < wanted.size(); seat++) {
            ParticipantDto dto = wanted.get(seat);
            Participant p = existing.get(dto.playerId());
            if (p == null) {
                Player player = players.get(dto.playerId());
                p = new Participant(game, player, seat);
            }
            p.setSeat(seat);
            p.setFaction(blankToNull(dto.faction()));
            p.setVictoryPoints(dto.victoryPoints());
            p.setPlacement(dto.placement());
            next.add(p);
        }
        game.getParticipants().retainAll(next);
        for (Participant p : next) {
            if (!game.getParticipants().contains(p)) {
                game.getParticipants().add(p);
            }
        }
        game.getParticipants().sort(Comparator.comparingInt(Participant::getSeat));
    }

    private static void checkUnique(List<ParticipantDto> list) {
        var seenPlayers = new HashSet<Long>();
        var seenFactions = new HashSet<String>();
        for (ParticipantDto p : list) {
            if (!seenPlayers.add(p.playerId())) {
                throw new IllegalArgumentException("Ein Spieler ist doppelt eingetragen.");
            }
            String f = blankToNull(p.faction());
            if (f != null && !seenFactions.add(f)) {
                throw new IllegalArgumentException("Eine Fraktion kann pro Spiel nur einmal gewählt werden.");
            }
        }
    }

    /**
     * Fehlt bei einem gespielten Spiel irgendeine Platzierung, wird die ganze Reihenfolge aus den Siegpunkten
     * abgeleitet (mehr Punkte = besserer Platz, bei Gleichstand zählt die Reihenfolge der Liste).
     */
    static List<ParticipantDto> withPlacements(List<ParticipantDto> list) {
        boolean complete = !list.isEmpty() && list.stream().allMatch(p -> p.placement() != null);
        if (complete) {
            return list;
        }
        List<ParticipantDto> ranked = new ArrayList<>(list);
        ranked.sort(Comparator.comparing((ParticipantDto p) -> Objects.requireNonNullElse(p.victoryPoints(), 0)).reversed());
        return list.stream()
                .map(p -> new ParticipantDto(p.playerId(), p.faction(), p.victoryPoints(), ranked.indexOf(p) + 1))
                .toList();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
