package com.personal.urlshortner.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkClickRealtimeEvent {
    private String type;
    private String workspaceId;
    private String linkId;
    private String slug;
    private Long clicks;
    private String lastClickedAt;

    private String referrer;
    private String browser;
    private String deviceType;
    private String country;
    private String createdAt;
}
