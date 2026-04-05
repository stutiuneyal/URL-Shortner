package com.personal.urlshortner.model;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Link {

    @Id
    private String id;

    private String workspaceId;
    private String domainId;

    private String slug;
    private String target;

    private Map<String, Object> rules;

    private String passwordHash;

    private Instant expiresAt;
    private Integer clickLimit;
    private Long clicks;
    private Instant lastClickedAt;

    private Boolean utmStrip;
    private List<String> tags;

    private Boolean active;

    private Boolean archived;
    private Instant archivedAt;
    private String archivedBy;

    private String createdBy;
    private Instant createdAt;
}