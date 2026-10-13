package de.ti4.hub.game;

import java.time.LocalDateTime;
import java.util.List;

public record GameDto(
        Long id,
        LocalDateTime scheduledAt,
        String location,
        GameStatus status,
        int pointsToWin,
        String notes,
        long version,
        List<ParticipantDto> participants) {

    static GameDto of(Game g) {
        return new GameDto(g.getId(), g.getScheduledAt(), g.getLocation(), g.getStatus(), g.getPointsToWin(),
                g.getNotes(), g.getVersion(), g.getParticipants().stream().map(ParticipantDto::of).toList());
    }
}
