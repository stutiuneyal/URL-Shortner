package com.personal.urlshortner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.dto.ai.LinkChatResponse;
import com.personal.urlshortner.dto.ai.LinkChatSendRequest;
import com.personal.urlshortner.service.ai.AIChatService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.personal.urlshortner.dto.ai.LinkInsightResponse;
import com.personal.urlshortner.service.ai.AIInsightsService;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIInsightsService aiInsightsService;
    private final AIChatService aiChatService;

    public AIController(AIInsightsService aiInsightsService, AIChatService aiChatService) {
        this.aiInsightsService = aiInsightsService;
        this.aiChatService = aiChatService;
    }

    @GetMapping("/links/{linkId}/insights")
    public ResponseEntity<LinkInsightResponse> getLinkInsights(
            @AuthenticationPrincipal String userId,
            @PathVariable String linkId) {
        return ResponseEntity.ok(aiInsightsService.getInsights(userId, linkId));
    }

    @GetMapping("/links/{linkId}/chat")
    public ResponseEntity<LinkChatResponse> getLinkChat(
            @AuthenticationPrincipal String userId,
            @PathVariable String linkId) {
        return ResponseEntity.ok(aiChatService.getChat(userId, linkId));
    }

    @PostMapping("/links/{linkId}/chat")
    public ResponseEntity<LinkChatResponse> sendLinkChatMessage(
            @AuthenticationPrincipal String userId,
            @PathVariable String linkId,
            @Valid @RequestBody LinkChatSendRequest request) {
        return ResponseEntity.ok(aiChatService.sendMessage(userId, linkId, request));
    }
}