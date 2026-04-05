package com.personal.urlshortner.controller;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.service.IAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private IAnalyticsService analyticsService;

    @RequestMapping(value = "/summary", method = RequestMethod.GET)
    public ResponseEntity<?> getSummary(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "workspace_id") String workspaceId) {
        return ResponseEntity.ok(analyticsService.summary(userId, workspaceId));
    }

    @RequestMapping(value = "/dashboard", method = RequestMethod.GET)
    public ResponseEntity<?> getDashboard(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "workspace_id") String workspaceId) {
        return ResponseEntity.ok(analyticsService.dashboard(userId, workspaceId));
    }

    @RequestMapping(value = "/link/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getLinkAnalytics(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(analyticsService.linkAnalytics(userId, linkId));
    }

    @RequestMapping(value = "/export/link/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> exportLinkAnalyticsCsv(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {

        byte[] csv = analyticsService.exportLinkAnalyticsCsv(userId, linkId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"link-analytics-" + linkId + ".csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(csv);
    }
}