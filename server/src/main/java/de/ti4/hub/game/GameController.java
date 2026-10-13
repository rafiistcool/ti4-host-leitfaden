package de.ti4.hub.game;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
class GameController {

    private final GameService service;

    GameController(GameService service) {
        this.service = service;
    }

    /** Alle Spiele, neueste zuerst. Für eine Spielrunde unter Freunden reicht das ohne Paging. */
    @GetMapping
    List<GameDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    GameDto get(@PathVariable Long id) {
        return service.find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    GameDto create(@Valid @RequestBody GameRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    GameDto update(@PathVariable Long id, @Valid @RequestBody GameRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
