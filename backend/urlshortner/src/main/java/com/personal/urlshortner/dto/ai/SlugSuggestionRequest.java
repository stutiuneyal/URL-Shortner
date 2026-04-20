package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlugSuggestionRequest {
    private String workspaceId;
    private String domainId;
    private String target;
    private String brandHint;
}