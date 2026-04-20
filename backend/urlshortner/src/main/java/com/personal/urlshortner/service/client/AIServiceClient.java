package com.personal.urlshortner.service.client;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.ai.SlugSuggestionRequest;
import com.personal.urlshortner.dto.ai.SlugSuggestionResponse;

@Service
public class AIServiceClient {

    private final WebClient webClient;

    public AIServiceClient(
            @Value("${ai.service.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public SlugSuggestionResponse suggestSlugs(SlugSuggestionRequest request) {
        try {
            SlugSuggestionResponse response = webClient.post()
                    .uri("/ai/slug-suggestions")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                            .map(body -> new ResponseStatusException(clientResponse.statusCode(),
                                    "AI Service error: " + body)))
                    .bodyToMono(SlugSuggestionResponse.class)
                    .block(Duration.ofSeconds(12));

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "AI service returned an empty response");
            }

            return response;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to fetch slug suggestions",
                    ex);
        }
    }

}
