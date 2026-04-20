package com.personal.urlshortner.service.ai;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.ai.AIInsightItemDTO;
import com.personal.urlshortner.dto.ai.AIInsightRequest;
import com.personal.urlshortner.dto.ai.AIInsightResponse;
import com.personal.urlshortner.dto.ai.BreakdownItemDTO;
import com.personal.urlshortner.dto.ai.LinkAnalyticsPayloadDTO;
import com.personal.urlshortner.dto.ai.LinkInsightResponse;
import com.personal.urlshortner.dto.ai.LinkMetadataDTO;
import com.personal.urlshortner.dto.ai.RecentClickItemDTO;
import com.personal.urlshortner.dto.ai.TimelinePointDTO;
import com.personal.urlshortner.dto.analytics.LinkAnalyticsResponse;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.ai.InsightItem;
import com.personal.urlshortner.model.ai.LinkInsight;
import com.personal.urlshortner.repository.LinkInsightRepository;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.IAnalyticsService;

@Service
public class AIInsightsService {

    private final LinkRepository linkRepository;
    private final WorkspaceRepository workspaceRepository;
    private final LinkInsightRepository linkInsightRepository;
    private final IAnalyticsService analyticsService;
    private final AIServiceClient aiServiceClient;
    private final long freshnessMinutes;

    public AIInsightsService(
            LinkRepository linkRepository,
            WorkspaceRepository workspaceRepository,
            LinkInsightRepository linkInsightRepository,
            IAnalyticsService analyticsService,
            AIServiceClient aiServiceClient,
            @Value("${ai.insights.freshness-minutes:10}") long freshnessMinutes) {
        this.linkRepository = linkRepository;
        this.workspaceRepository = workspaceRepository;
        this.linkInsightRepository = linkInsightRepository;
        this.analyticsService = analyticsService;
        this.aiServiceClient = aiServiceClient;
        this.freshnessMinutes = freshnessMinutes;
    }

    public LinkInsightResponse getInsights(String userId, String linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        Workspace workspace = workspaceRepository.findById(link.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        boolean isMember = workspace.getMembers() != null && workspace.getMembers().stream()
                .anyMatch(member -> userId.equals(member.getUserId()));

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this link");
        }

        LinkInsight cachedInsight = linkInsightRepository.findTopByLinkIdOrderByGeneratedAtDesc(linkId)
                .orElse(null);

        if (isFresh(cachedInsight, link)) {
            return toLinkInsightResponse(cachedInsight, true);
        }

        LinkAnalyticsResponse analytics = analyticsService.linkAnalytics(userId,linkId);
        AIInsightRequest request = buildInsightRequest(link, analytics);
        AIInsightResponse aiResponse = aiServiceClient.generateInsights(request);

        LinkInsight savedInsight = saveInsight(link, aiResponse);

        return toLinkInsightResponse(savedInsight, false);
    }

    private boolean isFresh(LinkInsight insight, Link link) {
        if (insight == null) return false;
        if (!"ready".equalsIgnoreCase(insight.getStatus())) return false;
        if (insight.getGeneratedAt() == null) return false;

        Instant now = Instant.now();
        if (insight.getGeneratedAt().isBefore(now.minus(Duration.ofMinutes(freshnessMinutes)))) {
            return false;
        }

        Long currentClicks = link.getClicks() == null ? 0L : link.getClicks();
        Long insightClicks = insight.getBasedOnTotalClicks() == null ? 0L : insight.getBasedOnTotalClicks();
        if (!currentClicks.equals(insightClicks)) {
            return false;
        }

        Instant currentLastClickedAt = link.getLastClickedAt();
        Instant basedOnLastClickedAt = insight.getBasedOnLastClickedAt();

        if (currentLastClickedAt == null) {
            return true;
        }

        if (basedOnLastClickedAt == null) {
            return false;
        }

        return !currentLastClickedAt.isAfter(basedOnLastClickedAt);
    }

    private AIInsightRequest buildInsightRequest(Link link, LinkAnalyticsResponse analytics) {
        return AIInsightRequest.builder()
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
                .build();
    }

    private LinkInsight saveInsight(Link link, AIInsightResponse response) {
        Instant generatedAt = parseInstant(response.getGeneratedAt(), Instant.now());

        LinkInsight insight = LinkInsight.builder()
                .linkId(link.getId())
                .workspaceId(link.getWorkspaceId())
                .summary(response.getSummary())
                .insights(mapInsightItems(response.getInsights()))
                .model(response.getModel())
                .generatedAt(generatedAt)
                .basedOnLastClickedAt(link.getLastClickedAt())
                .basedOnTotalClicks(link.getClicks() == null ? 0L : link.getClicks())
                .status("ready")
                .build();

        return linkInsightRepository.save(insight);
    }

    private LinkInsightResponse toLinkInsightResponse(LinkInsight insight, boolean cached) {
        return LinkInsightResponse.builder()
                .linkId(insight.getLinkId())
                .workspaceId(insight.getWorkspaceId())
                .summary(insight.getSummary())
                .insights(insight.getInsights() == null
                        ? Collections.emptyList()
                        : insight.getInsights().stream()
                                .map(item -> AIInsightItemDTO.builder()
                                        .title(item.getTitle())
                                        .description(item.getDescription())
                                        .priority(item.getPriority())
                                        .category(item.getCategory())
                                        .build())
                                .collect(Collectors.toList()))
                .model(insight.getModel())
                .generatedAt(insight.getGeneratedAt() != null ? insight.getGeneratedAt().toString() : null)
                .basedOnTotalClicks(insight.getBasedOnTotalClicks())
                .basedOnLastClickedAt(insight.getBasedOnLastClickedAt() != null
                        ? insight.getBasedOnLastClickedAt().toString()
                        : null)
                .cached(cached)
                .status(insight.getStatus())
                .build();
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

    private List<InsightItem> mapInsightItems(List<AIInsightItemDTO> items) {
        if (items == null) return Collections.emptyList();

        return items.stream()
                .map(item -> InsightItem.builder()
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .priority(item.getPriority())
                        .category(item.getCategory())
                        .build())
                .collect(Collectors.toList());
    }

    private Instant parseInstant(String value, Instant fallback) {
        try {
            return value == null || value.isBlank() ? fallback : Instant.parse(value);
        } catch (Exception ex) {
            return fallback;
        }
    }
}