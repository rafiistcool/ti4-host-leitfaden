package de.ti4.hub.player;

public record PlayerDto(Long id, String name) {

    static PlayerDto of(Player p) {
        return new PlayerDto(p.getId(), p.getName());
    }
}
