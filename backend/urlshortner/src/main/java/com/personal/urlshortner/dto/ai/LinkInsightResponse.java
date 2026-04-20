package com.personal.urlshortner.dto.ai;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkInsightResponse {
    private String linkId;
    private String workspaceId;
    private String summary;
    private List<AIInsightItemDTO> insights;
    private String model;
    private String generatedAt;
    private Long basedOnTotalClicks;
    private String basedOnLastClickedAt;
    private Boolean cached;
    private String status;
}