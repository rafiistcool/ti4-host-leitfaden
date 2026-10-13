package de.ti4.hub.game;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ParticipantDto(
        @NotNull(message = "Jeder Platz braucht einen Spieler.")
        Long playerId,
        @Pattern(regexp = "[a-z0-9]{2,24}", message = "Unbekannte Fraktion.")
        String faction,
        @Min(value = 0, message = "Siegpunkte können nicht negativ sein.")
        @Max(value = 30, message = "Mehr als 30 Siegpunkte? Bitte prüfen.")
        Integer victoryPoints,
        @Min(value = 1, message = "Platzierungen beginnen bei 1.")
        @Max(value = 8, message = "Höchstens 8 Spieler.")
        Integer placement) {

    static ParticipantDto of(Participant p) {
        return new ParticipantDto(p.getPlayer().getId(), p.getFaction(), p.getVictoryPoints(), p.getPlacement());
    }
}
