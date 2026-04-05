package com.personal.urlshortner.dto.analytics;

import java.util.List;

import com.personal.urlshortner.model.Link;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkAnalyticsResponse {

    private LinkDetail link;
    private Summary summary;
    private List<TimelinePoint> timeline;
    private List<BreakdownItem> referrers;
    private List<BreakdownItem> devices;
    private List<BreakdownItem> browsers;
    private List<BreakdownItem> countries;
    private List<RecentClickItem> recentClicks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkDetail {
        private String id;
        private String workspaceId;
        private String domainId;
        private String slug;
        private String target;
        private Boolean active;
        private Boolean archived;
        private String status;
        private Long clicks;
        private Integer clickLimit;
        private String expiresAt;
        private String lastClickedAt;
        private Boolean protectedLink;
        private Boolean utmStrip;
        private List<String> tags;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long totalClicks;
        private String lastClickedAt;
        private String createdAt;
        private String expiresAt;
        private Integer clickLimit;
        private String status;
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentClickItem {
        private String id;
        private String createdAt;
        private String referer;
        private String browser;
        private String deviceType;
        private String country;
    }
}