package de.ti4.hub;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Nur nötig, wenn die Seite von einer anderen Adresse kommt als die API (z. B. GitHub Pages + eigener Server).
 * Hinter dem nginx aus docker-compose laufen beide unter derselben Adresse, dann bleibt die Liste leer.
 */
@Configuration
class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    CorsConfig(@Value("${ti4.cors.allowed-origins:}") List<String> allowedOrigins) {
        this.allowedOrigins = allowedOrigins.stream().filter(s -> !s.isBlank()).toList();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        if (allowedOrigins.isEmpty()) {
            return;
        }
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
