package com.personal.urlshortner.service.ai;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.ai.AIChatRequest;
import com.personal.urlshortner.dto.ai.AIChatResponse;
import com.personal.urlshortner.dto.ai.AIInsightRequest;
import com.personal.urlshortner.dto.ai.AIInsightResponse;
import com.personal.urlshortner.dto.ai.SlugSuggestionRequest;
import com.personal.urlshortner.dto.ai.SlugSuggestionResponse;

@Service
public class AIServiceClient {

    private final WebClient aiWebClient;

    public AIServiceClient(WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    public AIInsightResponse generateInsights(AIInsightRequest request) {
        try {
            AIInsightResponse response = aiWebClient.post()
                    .uri("/ai/insights")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                            .map(body -> new ResponseStatusException(
                                    clientResponse.statusCode(),
                                    "AI service error: " + body)))
                    .bodyToMono(AIInsightResponse.class)
                    .block(Duration.ofSeconds(15));

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
                    "Failed to generate AI insights",
                    ex);
        }
    }

    public AIChatResponse generateChat(AIChatRequest request) {
        try {
            AIChatResponse response = aiWebClient.post()
                    .uri("/ai/chat")
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                            .map(body -> new ResponseStatusException(
                                    clientResponse.statusCode(),
                                    "AI service error: " + body)))
                    .bodyToMono(AIChatResponse.class)
                    .block(Duration.ofSeconds(15));

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "AI chat service returned an empty response");
            }

            return response;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to generate AI chat response",
                    ex);
        }
    }

    public SlugSuggestionResponse suggestSlugs(SlugSuggestionRequest request) {
        try {
            SlugSuggestionResponse response = aiWebClient.post()
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