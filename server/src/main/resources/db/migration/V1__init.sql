CREATE TABLE player (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(40) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE game (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheduled_at  TIMESTAMP NOT NULL,
    location      VARCHAR(80),
    status        VARCHAR(16) NOT NULL,
    points_to_win INT NOT NULL,
    notes         VARCHAR(2000),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    version       BIGINT NOT NULL
);

CREATE TABLE participant (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_id        BIGINT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    player_id      BIGINT NOT NULL REFERENCES player (id),
    seat           INT NOT NULL,
    faction        VARCHAR(24),
    victory_points INT,
    placement      INT
);

CREATE INDEX idx_participant_game ON participant (game_id);
CREATE INDEX idx_participant_player ON participant (player_id);
CREATE INDEX idx_game_scheduled ON game (scheduled_at);
