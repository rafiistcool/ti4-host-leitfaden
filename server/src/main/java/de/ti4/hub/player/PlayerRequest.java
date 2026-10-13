package de.ti4.hub.player;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlayerRequest(
        @NotBlank(message = "Bitte einen Namen eingeben.")
        @Size(max = 40, message = "Der Name darf höchstens 40 Zeichen haben.")
        String name) {
}
