package de.ti4.hub.game;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Anlegen und Bearbeiten. Die Teilnehmerliste ersetzt die bisherige komplett.
 * {@code version} kommt aus dem zuletzt geladenen Stand; beim Anlegen weglassen.
 */
public record GameRequest(
        @NotNull(message = "Bitte Datum und Uhrzeit angeben.")
        LocalDateTime scheduledAt,
        @Size(max = 80, message = "Der Ort darf höchstens 80 Zeichen haben.")
        String location,
        @NotNull(message = "Bitte einen Status angeben.")
        GameStatus status,
        @Min(value = 4, message = "Mindestens 4 Siegpunkte zum Sieg.")
        @Max(value = 20, message = "Höchstens 20 Siegpunkte zum Sieg.")
        Integer pointsToWin,
        @Size(max = 2000, message = "Die Notiz darf höchstens 2000 Zeichen haben.")
        String notes,
        Long version,
        @Size(max = 8, message = "Höchstens 8 Spieler pro Spiel.")
        List<@Valid ParticipantDto> participants) {
}
