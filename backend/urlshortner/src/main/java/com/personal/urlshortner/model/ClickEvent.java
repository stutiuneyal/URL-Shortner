package com.personal.urlshortner.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("click_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickEvent {

    @Id
    private String id;

    private String linkId;
    private String workspaceId;
    private String slug;

    private String referer;
    private String userAgent;
    private String browser;
    private String deviceType;

    private String country;
    private String countryCode;

    private Instant createdAt;
}