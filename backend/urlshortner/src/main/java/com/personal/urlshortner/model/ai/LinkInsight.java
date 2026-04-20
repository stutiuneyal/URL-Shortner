package com.personal.urlshortner.model.ai;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("link_insights")
public class LinkInsight {

    @Id
    private String id;

    private String linkId;
    private String workspaceId;

    private String summary;
    private List<InsightItem> insights;

    private String model;
    private Instant generatedAt;

    private Instant basedOnLastClickedAt;
    private Long basedOnTotalClicks;

    private String status; // ready, failed, stale
}