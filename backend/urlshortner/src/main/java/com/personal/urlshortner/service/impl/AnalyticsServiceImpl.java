package com.personal.urlshortner.service.impl;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.analytics.DashboardAnalyticsResponse;
import com.personal.urlshortner.dto.analytics.LinkAnalyticsResponse;
import com.personal.urlshortner.model.ClickEvent;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.helper.Member;
import com.personal.urlshortner.repository.ClickEventRepository;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.IAnalyticsService;

@Service
public class AnalyticsServiceImpl implements IAnalyticsService {

        @Autowired
        private LinkRepository linkRepository;

        @Autowired
        private WorkspaceRepository workspaceRepository;

        @Autowired
        private ClickEventRepository clickEventRepository;

        @Override
        public Map<String, Long> summary(String userId, String workspaceId) {
                Workspace workspace = getWorkspaceOrThrow(workspaceId);
                validateWorkspaceAccess(userId, workspace);

                List<Link> links = linkRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

                long total = links.size();
                long active = links.stream().filter(l -> Boolean.TRUE.equals(l.getActive())).count();
                long clicks = links.stream().mapToLong(l -> l.getClicks() == null ? 0L : l.getClicks()).sum();
                long expiringSoon = countExpiringSoon(links);

                return Map.of(
                                "total", total,
                                "active", active,
                                "clicks", clicks,
                                "expiringSoon", expiringSoon);
        }

        @Override
        public DashboardAnalyticsResponse dashboard(String userId, String workspaceId) {
                Workspace workspace = getWorkspaceOrThrow(workspaceId);
                validateWorkspaceAccess(userId, workspace);

                List<Link> links = linkRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
                Instant now = Instant.now();

                long total = links.size();
                long active = links.stream().filter(l -> Boolean.TRUE.equals(l.getActive())).count();
                long totalClicks = links.stream().mapToLong(l -> l.getClicks() == null ? 0L : l.getClicks()).sum();
                long expiringSoon = countExpiringSoon(links);
                long protectedLinks = links.stream()
                                .filter(l -> l.getPasswordHash() != null && !l.getPasswordHash().isBlank()).count();

                long live = links.stream().filter(l -> isLive(l, now)).count();
                long paused = links.stream().filter(
                                l -> !Boolean.TRUE.equals(l.getActive()) && !Boolean.TRUE.equals(l.getArchived()))
                                .count();
                long expired = links.stream().filter(l -> isExpired(l, now)).count();

                double avgClicks = total == 0 ? 0.0 : ((double) totalClicks) / total;

                List<DashboardAnalyticsResponse.TopLinkItem> topLinks = links.stream()
                                .sorted(Comparator.comparingLong((Link l) -> l.getClicks() == null ? 0L : l.getClicks())
                                                .reversed())
                                .limit(7)
                                .map(link -> DashboardAnalyticsResponse.TopLinkItem.builder()
                                                .id(link.getId())
                                                .slug(link.getSlug())
                                                .target(link.getTarget())
                                                .clicks(link.getClicks() == null ? 0L : link.getClicks())
                                                .active(link.getActive())
                                                .domainId(link.getDomainId())
                                                .build())
                                .toList();

                List<DashboardAnalyticsResponse.RecentLinkItem> recentLinks = links.stream()
                                .sorted(Comparator.comparing(Link::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(6)
                                .map(link -> DashboardAnalyticsResponse.RecentLinkItem.builder()
                                                .id(link.getId())
                                                .slug(link.getSlug())
                                                .target(link.getTarget())
                                                .clicks(link.getClicks() == null ? 0L : link.getClicks())
                                                .active(link.getActive())
                                                .domainId(link.getDomainId())
                                                .createdAt(asString(link.getCreatedAt()))
                                                .expiresAt(asString(link.getExpiresAt()))
                                                .build())
                                .toList();

                List<DashboardAnalyticsResponse.ExpiringLinkItem> expiringSoonItems = links.stream()
                                .filter(link -> link.getExpiresAt() != null)
                                .filter(link -> !link.getExpiresAt().isBefore(now))
                                .filter(link -> !link.getExpiresAt().isAfter(now.plus(7, ChronoUnit.DAYS)))
                                .sorted(Comparator.comparing(Link::getExpiresAt))
                                .limit(6)
                                .map(link -> DashboardAnalyticsResponse.ExpiringLinkItem.builder()
                                                .id(link.getId())
                                                .slug(link.getSlug())
                                                .target(link.getTarget())
                                                .expiresAt(asString(link.getExpiresAt()))
                                                .clicks(link.getClicks() == null ? 0L : link.getClicks())
                                                .build())
                                .toList();

                Instant timelineStart = now.minus(6, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
                List<ClickEvent> recentEvents = clickEventRepository.findByWorkspaceIdAndCreatedAtBetween(
                                workspaceId,
                                timelineStart,
                                now.plus(1, ChronoUnit.DAYS));

                Map<String, Long> timelineMap = new LinkedHashMap<>();
                ZoneId zone = ZoneId.systemDefault();

                for (int i = 6; i >= 0; i--) {
                        Instant day = now.minus(i, ChronoUnit.DAYS);
                        String label = day.atZone(zone).toLocalDate().toString();
                        timelineMap.put(label, 0L);
                }

                for (ClickEvent event : recentEvents) {
                        if (event.getCreatedAt() == null)
                                continue;
                        String label = event.getCreatedAt().atZone(zone).toLocalDate().toString();
                        timelineMap.computeIfPresent(label, (k, v) -> v + 1);
                }

                List<DashboardAnalyticsResponse.TimelinePoint> clicksTimeline = timelineMap.entrySet()
                                .stream()
                                .map(e -> DashboardAnalyticsResponse.TimelinePoint.builder()
                                                .label(e.getKey())
                                                .clicks(e.getValue())
                                                .build())
                                .toList();

                List<DashboardAnalyticsResponse.BreakdownItem> referrerBreakdown = buildDashboardBreakdown(
                                recentEvents.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getReferer(), "Direct"),
                                                Collectors.counting())));

                List<DashboardAnalyticsResponse.BreakdownItem> deviceBreakdown = buildDashboardBreakdown(
                                recentEvents.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getDeviceType(), "Unknown"),
                                                Collectors.counting())));

                List<DashboardAnalyticsResponse.BreakdownItem> browserBreakdown = buildDashboardBreakdown(
                                recentEvents.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getBrowser(), "Unknown"),
                                                Collectors.counting())));

                return DashboardAnalyticsResponse.builder()
                                .summary(DashboardAnalyticsResponse.Summary.builder()
                                                .total(total)
                                                .active(active)
                                                .clicks(totalClicks)
                                                .expiringSoon(expiringSoon)
                                                .protectedLinks(protectedLinks)
                                                .averageClicksPerLink(avgClicks)
                                                .build())
                                .statusBreakdown(DashboardAnalyticsResponse.StatusBreakdown.builder()
                                                .live(live)
                                                .paused(paused)
                                                .expired(expired)
                                                .protectedCount(protectedLinks)
                                                .build())
                                .topLinks(topLinks)
                                .recentLinks(recentLinks)
                                .expiringSoon(expiringSoonItems)
                                .clicksTimeline(clicksTimeline)
                                .referrerBreakdown(referrerBreakdown)
                                .deviceBreakdown(deviceBreakdown)
                                .browserBreakdown(browserBreakdown)
                                .build();
        }

        @Override
        public LinkAnalyticsResponse linkAnalytics(String userId, String linkId) {
                Link link = getLinkOrThrow(linkId);
                Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
                validateWorkspaceAccess(userId, workspace);

                List<ClickEvent> events = clickEventRepository.findByLinkId(linkId);
                Instant now = Instant.now();
                ZoneId zone = ZoneId.systemDefault();

                Map<String, Long> timelineMap = new LinkedHashMap<>();
                for (int i = 6; i >= 0; i--) {
                        Instant day = now.minus(i, ChronoUnit.DAYS);
                        String label = day.atZone(zone).toLocalDate().toString();
                        timelineMap.put(label, 0L);
                }

                for (ClickEvent event : events) {
                        if (event.getCreatedAt() == null)
                                continue;
                        String label = event.getCreatedAt().atZone(zone).toLocalDate().toString();
                        timelineMap.computeIfPresent(label, (k, v) -> v + 1);
                }

                List<LinkAnalyticsResponse.TimelinePoint> timeline = timelineMap.entrySet()
                                .stream()
                                .map(e -> LinkAnalyticsResponse.TimelinePoint.builder()
                                                .label(e.getKey())
                                                .clicks(e.getValue())
                                                .build())
                                .toList();

                List<LinkAnalyticsResponse.BreakdownItem> referrers = buildLinkBreakdown(
                                events.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getReferer(), "Direct"),
                                                Collectors.counting())));

                List<LinkAnalyticsResponse.BreakdownItem> devices = buildLinkBreakdown(
                                events.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getDeviceType(), "Unknown"),
                                                Collectors.counting())));

                List<LinkAnalyticsResponse.BreakdownItem> browsers = buildLinkBreakdown(
                                events.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getBrowser(), "Unknown"),
                                                Collectors.counting())));

                List<LinkAnalyticsResponse.BreakdownItem> countries = buildLinkBreakdown(
                                events.stream().collect(Collectors.groupingBy(
                                                event -> safeLabel(event.getCountry(), "Unknown"),
                                                Collectors.counting())));

                List<LinkAnalyticsResponse.RecentClickItem> recentClicks = events.stream()
                                .sorted(Comparator.comparing(ClickEvent::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .limit(15)
                                .map(event -> LinkAnalyticsResponse.RecentClickItem.builder()
                                                .id(event.getId())
                                                .createdAt(asString(event.getCreatedAt()))
                                                .referer(safeLabel(event.getReferer(), "Direct"))
                                                .browser(safeLabel(event.getBrowser(), "Unknown"))
                                                .deviceType(safeLabel(event.getDeviceType(), "Unknown"))
                                                .country(safeLabel(event.getCountry(), "Unknown"))
                                                .build())
                                .toList();

                return LinkAnalyticsResponse.builder()
                                .link(LinkAnalyticsResponse.LinkDetail.builder()
                                                .id(link.getId())
                                                .workspaceId(link.getWorkspaceId())
                                                .domainId(link.getDomainId())
                                                .slug(link.getSlug())
                                                .target(link.getTarget())
                                                .active(link.getActive())
                                                .archived(link.getArchived())
                                                .status(resolveStatus(link, now))
                                                .clicks(link.getClicks() == null ? 0L : link.getClicks())
                                                .clickLimit(link.getClickLimit())
                                                .expiresAt(asString(link.getExpiresAt()))
                                                .lastClickedAt(asString(link.getLastClickedAt()))
                                                .protectedLink(link.getPasswordHash() != null
                                                                && !link.getPasswordHash().isBlank())
                                                .utmStrip(Boolean.TRUE.equals(link.getUtmStrip()))
                                                .tags(link.getTags())
                                                .createdAt(asString(link.getCreatedAt()))
                                                .build())
                                .summary(LinkAnalyticsResponse.Summary.builder()
                                                .totalClicks(link.getClicks() == null ? 0L : link.getClicks())
                                                .lastClickedAt(asString(link.getLastClickedAt()))
                                                .createdAt(asString(link.getCreatedAt()))
                                                .expiresAt(asString(link.getExpiresAt()))
                                                .clickLimit(link.getClickLimit())
                                                .status(resolveStatus(link, now))
                                                .build())
                                .timeline(timeline)
                                .referrers(referrers)
                                .devices(devices)
                                .browsers(browsers)
                                .countries(countries)
                                .recentClicks(recentClicks)
                                .build();
        }

        @Override
        public byte[] exportLinkAnalyticsCsv(String userId, String linkId) {
                Link link = getLinkOrThrow(linkId);
                Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
                validateWorkspaceAccess(userId, workspace);

                List<ClickEvent> events = clickEventRepository.findByLinkId(linkId)
                                .stream()
                                .sorted(Comparator.comparing(ClickEvent::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();

                StringBuilder sb = new StringBuilder();
                sb.append("linkId,slug,target,clickTimestamp,referer,browser,deviceType,country\n");

                for (ClickEvent event : events) {
                        sb.append(csv(link.getId())).append(",")
                                        .append(csv(link.getSlug())).append(",")
                                        .append(csv(link.getTarget())).append(",")
                                        .append(csv(asString(event.getCreatedAt()))).append(",")
                                        .append(csv(event.getReferer())).append(",")
                                        .append(csv(event.getBrowser())).append(",")
                                        .append(csv(event.getDeviceType())).append(",")
                                        .append(csv(event.getCountry()))
                                        .append("\n");
                }

                return sb.toString().getBytes(StandardCharsets.UTF_8);
        }

        private List<DashboardAnalyticsResponse.BreakdownItem> buildDashboardBreakdown(Map<String, Long> source) {
                return source.entrySet()
                                .stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .limit(6)
                                .map(e -> DashboardAnalyticsResponse.BreakdownItem.builder()
                                                .label(e.getKey())
                                                .value(e.getValue())
                                                .build())
                                .toList();
        }

        private List<LinkAnalyticsResponse.BreakdownItem> buildLinkBreakdown(Map<String, Long> source) {
                return source.entrySet()
                                .stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .limit(8)
                                .map(e -> LinkAnalyticsResponse.BreakdownItem.builder()
                                                .label(e.getKey())
                                                .value(e.getValue())
                                                .build())
                                .toList();
        }

        private String csv(String value) {
                if (value == null)
                        return "";
                String escaped = value.replace("\"", "\"\"");
                return "\"" + escaped + "\"";
        }

        private String safeLabel(String value, String fallback) {
                return value == null || value.isBlank() ? fallback : value;
        }

        private String asString(Instant value) {
                return value == null ? null : value.toString();
        }

        private String resolveStatus(Link link, Instant now) {
                if (Boolean.TRUE.equals(link.getArchived()))
                        return "Archived";
                if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(now))
                        return "Expired";
                if (!Boolean.TRUE.equals(link.getActive()))
                        return "Paused";
                return "Live";
        }

        private long countExpiringSoon(List<Link> links) {
                Instant now = Instant.now();
                Instant upper = now.plus(7, ChronoUnit.DAYS);

                return links.stream()
                                .filter(link -> link.getExpiresAt() != null)
                                .filter(link -> !link.getExpiresAt().isBefore(now))
                                .filter(link -> !link.getExpiresAt().isAfter(upper))
                                .count();
        }

        private boolean isExpired(Link link, Instant now) {
                return link.getExpiresAt() != null && link.getExpiresAt().isBefore(now);
        }

        private boolean isLive(Link link, Instant now) {
                return Boolean.TRUE.equals(link.getActive())
                                && !Boolean.TRUE.equals(link.getArchived())
                                && !isExpired(link, now);
        }

        private Link getLinkOrThrow(String linkId) {
                return linkRepository.findById(linkId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
        }

        private Workspace getWorkspaceOrThrow(String workspaceId) {
                return workspaceRepository.findById(workspaceId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Workspace not found"));
        }

        private void validateWorkspaceAccess(String userId, Workspace workspace) {
                boolean isOwner = userId != null && userId.equals(workspace.getOwnerId());

                boolean isMember = workspace.getMembers() != null
                                && workspace.getMembers().stream()
                                                .map(Member::getUserId)
                                                .anyMatch(userId::equals);

                if (!isOwner && !isMember) {
                        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                                        "You do not have access to the provided workspace");
                }
        }
}