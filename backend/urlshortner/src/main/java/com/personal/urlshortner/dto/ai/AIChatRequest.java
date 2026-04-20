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
public class AIChatRequest {
    private LinkMetadataDTO link;
    private LinkAnalyticsPayloadDTO analytics;
    private List<AIChatMessageDTO> messages;
    private String question;
}