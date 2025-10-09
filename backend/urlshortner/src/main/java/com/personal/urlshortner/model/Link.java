package com.personal.urlshortner.model;

import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.personal.urlshortner.model.helper.Rule;

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

    @Indexed
    private String workspaceId;
    private String domainId;

    @Indexed(unique = true)
    private String slug;

    private String target;
    private List<Rule> rules;
    private String passwordHash;
    private Instant expiresAt;
    private Integer clickLimit;
    private Long clicks;
    private Boolean utmStrip;
    private List<String> tags;
    private Boolean active;
    private String createdBy;
    private Instant createdAt;
    private Instant lastClickedAt;

}
