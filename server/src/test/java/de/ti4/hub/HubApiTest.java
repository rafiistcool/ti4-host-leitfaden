package de.ti4.hub;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.jayway.jsonpath.JsonPath;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:hubtest;DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@DirtiesContext
class HubApiTest {

    @Autowired
    MockMvc mvc;

    private long createPlayer(String name) throws Exception {
        String body = mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    @Test
    void playersGamesAndPlacements() throws Exception {
        long rafi = createPlayer("Rafi");
        long basti = createPlayer("Basti");
        long robin = createPlayer("Robin");

        mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\" rafi \"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Es gibt schon einen Spieler namens „rafi“."));

        // geplantes Spiel mit Fraktionswahl
        String created = mvc.perform(post("/api/games").contentType(MediaType.APPLICATION_JSON).content("""
                        {"scheduledAt":"2026-10-17T18:00","location":"Bei Basti","status":"PLANNED","pointsToWin":10,
                         "participants":[{"playerId":%d,"faction":"sardakk"},{"playerId":%d},{"playerId":%d,"faction":"muaat"}]}
                        """.formatted(rafi, basti, robin)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scheduledAt").value("2026-10-17T18:00:00"))
                .andExpect(jsonPath("$.participants.length()").value(3))
                .andExpect(jsonPath("$.participants[1].faction").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        long gameId = ((Number) JsonPath.read(created, "$.id")).longValue();
        long version = ((Number) JsonPath.read(created, "$.version")).longValue();

        // doppelte Fraktion wird abgelehnt
        mvc.perform(put("/api/games/" + gameId).contentType(MediaType.APPLICATION_JSON).content("""
                        {"scheduledAt":"2026-10-17T18:00","status":"PLANNED",
                         "participants":[{"playerId":%d,"faction":"sardakk"},{"playerId":%d,"faction":"sardakk"}]}
                        """.formatted(rafi, basti)))
                .andExpect(status().isBadRequest());

        // als gespielt eintragen: Platzierung wird aus Siegpunkten abgeleitet, Robin fliegt raus
        String finished = mvc.perform(put("/api/games/" + gameId).contentType(MediaType.APPLICATION_JSON).content("""
                        {"scheduledAt":"2026-10-17T18:00","location":"Bei Basti","status":"FINISHED","pointsToWin":10,"version":%d,
                         "participants":[{"playerId":%d,"faction":"sardakk","victoryPoints":7},{"playerId":%d,"faction":"jolnar","victoryPoints":10}]}
                        """.formatted(version, rafi, basti)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINISHED"))
                .andExpect(jsonPath("$.participants.length()").value(2))
                .andExpect(jsonPath("$.participants[0].placement").value(2))
                .andExpect(jsonPath("$.participants[1].placement").value(1))
                .andReturn().getResponse().getContentAsString();
        long newVersion = ((Number) JsonPath.read(finished, "$.version")).longValue();
        org.assertj.core.api.Assertions.assertThat(newVersion).isGreaterThan(version);

        // veralteter Stand -> 409
        mvc.perform(put("/api/games/" + gameId).contentType(MediaType.APPLICATION_JSON).content("""
                        {"scheduledAt":"2026-10-17T18:00","status":"FINISHED","version":%d,"participants":[]}
                        """.formatted(version)))
                .andExpect(status().isConflict());

        // Spieler in einem Spiel kann nicht gelöscht werden, Robin schon
        mvc.perform(delete("/api/players/" + rafi)).andExpect(status().isConflict());
        mvc.perform(delete("/api/players/" + robin)).andExpect(status().isNoContent());

        mvc.perform(get("/api/games")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].participants[1].faction").value("jolnar"));

        mvc.perform(post("/api/players").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bitte einen Namen eingeben."));

        mvc.perform(get("/api/actuator/health")).andExpect(status().isOk());
    }
}
