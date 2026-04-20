package com.personal.urlshortner.service.ai;

import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.ai.AIChatMessageDTO;
import com.personal.urlshortner.dto.ai.AIChatRequest;
import com.personal.urlshortner.dto.ai.AIChatResponse;
import com.personal.urlshortner.dto.ai.BreakdownItemDTO;
import com.personal.urlshortner.dto.ai.LinkAnalyticsPayloadDTO;
import com.personal.urlshortner.dto.ai.LinkChatMessageResponse;
import com.personal.urlshortner.dto.ai.LinkChatResponse;
import com.personal.urlshortner.dto.ai.LinkChatSendRequest;
import com.personal.urlshortner.dto.ai.LinkMetadataDTO;
import com.personal.urlshortner.dto.ai.RecentClickItemDTO;
import com.personal.urlshortner.dto.ai.TimelinePointDTO;
import com.personal.urlshortner.dto.analytics.LinkAnalyticsResponse;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.ai.LinkChatMessage;
import com.personal.urlshortner.model.ai.LinkChatSession;
import com.personal.urlshortner.repository.LinkChatMessageRepository;
import com.personal.urlshortner.repository.LinkChatSessionRepository;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.IAnalyticsService;

import jakarta.validation.Valid;

@Service
public class AIChatService {

    private final LinkRepository linkRepository;
    private final WorkspaceRepository workspaceRepository;
    private final LinkChatSessionRepository linkChatSessionRepository;
    private final LinkChatMessageRepository linkChatMessageRepository;
    private final IAnalyticsService analyticsService;
    private final AIServiceClient aiServiceClient;

    public AIChatService(
            LinkRepository linkRepository,
            WorkspaceRepository workspaceRepository,
            LinkChatSessionRepository linkChatSessionRepository,
            LinkChatMessageRepository linkChatMessageRepository,
            IAnalyticsService analyticsService,
            AIServiceClient aiServiceClient) {
        this.linkRepository = linkRepository;
        this.workspaceRepository = workspaceRepository;
        this.linkChatSessionRepository = linkChatSessionRepository;
        this.linkChatMessageRepository = linkChatMessageRepository;
        this.analyticsService = analyticsService;
        this.aiServiceClient = aiServiceClient;
    }

    public LinkChatResponse getChat(String userId, String linkId) {
        Link link = getAuthorizedLink(userId, linkId);

        LinkChatSession session = getOrCreateSession(link, userId);
        List<LinkChatMessage> messages = linkChatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());

        return LinkChatResponse.builder()
                .sessionId(session.getId())
                .linkId(link.getId())
                .workspaceId(link.getWorkspaceId())
                .messages(mapMessages(messages))
                .suggestedQuestions(defaultSuggestedQuestions())
                .model(null)
                .generatedAt(null)
                .build();
    }

    public LinkChatResponse sendMessage(String userId, String linkId, @Valid LinkChatSendRequest request) {
        Link link = getAuthorizedLink(userId, linkId);
        LinkChatSession session = getOrCreateSession(link, userId);

        Instant now = Instant.now();
        String question = request.getQuestion().trim();

        LinkChatMessage userMessage = linkChatMessageRepository.save(
                LinkChatMessage.builder()
                        .sessionId(session.getId())
                        .linkId(link.getId())
                        .workspaceId(link.getWorkspaceId())
                        .userId(userId)
                        .role("user")
                        .content(question)
                        .createdAt(now)
                        .build()
        );

        List<LinkChatMessage> recentMessages = linkChatMessageRepository
                .findTop12BySessionIdOrderByCreatedAtDesc(session.getId());

        List<LinkChatMessage> orderedRecentMessages = recentMessages.stream()
                .sorted(Comparator.comparing(LinkChatMessage::getCreatedAt))
                .collect(Collectors.toList());

        LinkAnalyticsResponse analytics = analyticsService.linkAnalytics(userId,linkId);

        AIChatRequest aiRequest = AIChatRequest.builder()
                .link(LinkMetadataDTO.builder()
                        .id(link.getId())
                        .workspaceId(link.getWorkspaceId())
                        .slug(link.getSlug())
                        .target(link.getTarget())
                        .createdAt(link.getCreatedAt() != null ? link.getCreatedAt().toString() : null)
                        .clicks(link.getClicks() == null ? 0L : link.getClicks())
                        .active(link.getActive() == null ? Boolean.TRUE : link.getActive())
                        .expiresAt(link.getExpiresAt() != null ? link.getExpiresAt().toString() : null)
                        .build())
                .analytics(LinkAnalyticsPayloadDTO.builder()
                        .timeline(mapTimeline(analytics.getTimeline()))
                        .countries(mapBreakdowns(analytics.getCountries()))
                        .devices(mapBreakdowns(analytics.getDevices()))
                        .browsers(mapBreakdowns(analytics.getBrowsers()))
                        .referrers(mapBreakdowns(analytics.getReferrers()))
                        .recentClicks(mapRecentClicks(analytics.getRecentClicks()))
                        .build())
                .messages(orderedRecentMessages.stream()
                        .map(msg -> AIChatMessageDTO.builder()
                                .role(msg.getRole())
                                .content(msg.getContent())
                                .build())
                        .collect(Collectors.toList()))
                .question(question)
                .build();

        AIChatResponse aiResponse = aiServiceClient.generateChat(aiRequest);

        LinkChatMessage assistantMessage = linkChatMessageRepository.save(
                LinkChatMessage.builder()
                        .sessionId(session.getId())
                        .linkId(link.getId())
                        .workspaceId(link.getWorkspaceId())
                        .userId(userId)
                        .role("assistant")
                        .content(aiResponse.getAnswer())
                        .createdAt(Instant.now())
                        .build()
        );

        session.setUpdatedAt(Instant.now());
        linkChatSessionRepository.save(session);

        List<LinkChatMessage> allMessages = linkChatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());

        return LinkChatResponse.builder()
                .sessionId(session.getId())
                .linkId(link.getId())
                .workspaceId(link.getWorkspaceId())
                .messages(mapMessages(allMessages))
                .suggestedQuestions(aiResponse.getSuggestedQuestions() == null
                        ? Collections.emptyList()
                        : aiResponse.getSuggestedQuestions())
                .model(aiResponse.getModel())
                .generatedAt(aiResponse.getGeneratedAt())
                .build();
    }

    private Link getAuthorizedLink(String userId, String linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        Workspace workspace = workspaceRepository.findById(link.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        boolean isMember = workspace.getMembers() != null && workspace.getMembers().stream()
                .anyMatch(member -> userId.equals(member.getUserId()));

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this link");
        }

        return link;
    }

    private LinkChatSession getOrCreateSession(Link link, String userId) {
        return linkChatSessionRepository.findTopByLinkIdAndUserIdOrderByUpdatedAtDesc(link.getId(), userId)
                .orElseGet(() -> {
                    Instant now = Instant.now();
                    return linkChatSessionRepository.save(
                            LinkChatSession.builder()
                                    .linkId(link.getId())
                                    .workspaceId(link.getWorkspaceId())
                                    .userId(userId)
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build()
                    );
                });
    }

    private List<LinkChatMessageResponse> mapMessages(List<LinkChatMessage> messages) {
        if (messages == null) return Collections.emptyList();

        return messages.stream()
                .map(msg -> LinkChatMessageResponse.builder()
                        .id(msg.getId())
                        .role(msg.getRole())
                        .content(msg.getContent())
                        .createdAt(msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    private List<String> defaultSuggestedQuestions() {
        return List.of(
                "Why is this link performing well?",
                "Which country is driving most traffic?",
                "What should I improve next?"
        );
    }

    private List<TimelinePointDTO> mapTimeline(List<LinkAnalyticsResponse.TimelinePoint> items) {
        if (items == null) return Collections.emptyList();

        return items.stream()
                .map(item -> TimelinePointDTO.builder()
                        .label(item.getLabel())
                        .clicks(item.getClicks() == null ? 0L : item.getClicks())
                        .build())
                .collect(Collectors.toList());
    }

    private List<BreakdownItemDTO> mapBreakdowns(List<LinkAnalyticsResponse.BreakdownItem> items) {
        if (items == null) return Collections.emptyList();

        return items.stream()
                .map(item -> BreakdownItemDTO.builder()
                        .label(item.getLabel())
                        .value(item.getValue() == null ? 0L : item.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RecentClickItemDTO> mapRecentClicks(List<LinkAnalyticsResponse.RecentClickItem> items) {
        if (items == null) return Collections.emptyList();

        return items.stream()
                .map(item -> RecentClickItemDTO.builder()
                        .createdAt(item.getCreatedAt())
                        .referer(item.getReferer())
                        .browser(item.getBrowser())
                        .deviceType(item.getDeviceType())
                        .country(item.getCountry())
                        .build())
                .collect(Collectors.toList());
    }
}