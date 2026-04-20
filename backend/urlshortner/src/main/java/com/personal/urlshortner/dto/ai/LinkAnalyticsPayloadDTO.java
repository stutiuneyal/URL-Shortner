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
public class LinkAnalyticsPayloadDTO {
    private List<TimelinePointDTO> timeline;
    private List<BreakdownItemDTO> countries;
    private List<BreakdownItemDTO> devices;
    private List<BreakdownItemDTO> browsers;
    private List<BreakdownItemDTO> referrers;
    private List<RecentClickItemDTO> recentClicks;
}