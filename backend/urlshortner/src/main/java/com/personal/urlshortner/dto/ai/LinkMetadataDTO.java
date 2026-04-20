package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkMetadataDTO {
    private String id;
    private String workspaceId;
    private String slug;
    private String target;
    private String createdAt;
    private Long clicks;
    private Boolean active;
    private String expiresAt;
}