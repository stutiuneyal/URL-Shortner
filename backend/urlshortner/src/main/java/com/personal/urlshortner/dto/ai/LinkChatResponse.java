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
public class LinkChatResponse {
    private String sessionId;
    private String linkId;
    private String workspaceId;
    private List<LinkChatMessageResponse> messages;
    private List<String> suggestedQuestions;
    private String model;
    private String generatedAt;
}