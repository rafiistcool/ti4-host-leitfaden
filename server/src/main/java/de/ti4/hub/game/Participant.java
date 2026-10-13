package de.ti4.hub.game;

import de.ti4.hub.player.Player;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Ein Spieler in einem Spiel: gewählte Fraktion, Siegpunkte und Platz. */
@Entity
@Table(name = "participant")
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id")
    private Player player;

    /** Reihenfolge am Tisch bzw. in der Liste. */
    @Column(nullable = false)
    private int seat;

    /** Fraktions-ID wie im Kompendium der Seite, z. B. "sardakk". Leer = noch nicht gewählt. */
    @Column(length = 24)
    private String faction;

    @Column(name = "victory_points")
    private Integer victoryPoints;

    private Integer placement;

    protected Participant() {
    }

    Participant(Game game, Player player, int seat) {
        this.game = game;
        this.player = player;
        this.seat = seat;
    }

    public Long getId() {
        return id;
    }

    public Game getGame() {
        return game;
    }

    public Player getPlayer() {
        return player;
    }

    public int getSeat() {
        return seat;
    }

    void setSeat(int seat) {
        this.seat = seat;
    }

    public String getFaction() {
        return faction;
    }

    public void setFaction(String faction) {
        this.faction = faction;
    }

    public Integer getVictoryPoints() {
        return victoryPoints;
    }

    public void setVictoryPoints(Integer victoryPoints) {
        this.victoryPoints = victoryPoints;
    }

    public Integer getPlacement() {
        return placement;
    }

    public void setPlacement(Integer placement) {
        this.placement = placement;
    }
}
