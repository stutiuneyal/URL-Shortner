package com.personal.urlshortner.dto.analytics;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardAnalyticsResponse {

    private Summary summary;
    private StatusBreakdown statusBreakdown;
    private List<TopLinkItem> topLinks;
    private List<RecentLinkItem> recentLinks;
    private List<ExpiringLinkItem> expiringSoon;

    private List<TimelinePoint> clicksTimeline;
    private List<BreakdownItem> referrerBreakdown;
    private List<BreakdownItem> deviceBreakdown;
    private List<BreakdownItem> browserBreakdown;
    private List<BreakdownItem> countryBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private long total;
        private long active;
        private long clicks;
        private long expiringSoon;
        private long protectedLinks;
        private double averageClicksPerLink;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusBreakdown {
        private long live;
        private long paused;
        private long expired;
        private long protectedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopLinkItem {
        private String id;
        private String slug;
        private String target;
        private Long clicks;
        private Boolean active;
        private String domainId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentLinkItem {
        private String id;
        private String slug;
        private String target;
        private Long clicks;
        private Boolean active;
        private String domainId;
        private String createdAt;
        private String expiresAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpiringLinkItem {
        private String id;
        private String slug;
        private String target;
        private String expiresAt;
        private Long clicks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelinePoint {
        private String label;
        private Long clicks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakdownItem {
        private String label;
        private Long value;
    }
}