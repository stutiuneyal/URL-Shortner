package com.personal.urlshortner.service;

import java.util.Map;

import com.personal.urlshortner.dto.analytics.DashboardAnalyticsResponse;
import com.personal.urlshortner.dto.analytics.LinkAnalyticsResponse;

public interface IAnalyticsService {

    Map<String, Long> summary(String userId, String workspaceId);

    DashboardAnalyticsResponse dashboard(String userId, String workspaceId);

    LinkAnalyticsResponse linkAnalytics(String userId, String linkId);

    byte[] exportLinkAnalyticsCsv(String userId, String linkId);
}