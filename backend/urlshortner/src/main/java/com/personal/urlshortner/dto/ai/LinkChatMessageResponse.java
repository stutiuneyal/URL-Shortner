package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkChatMessageResponse {
    private String id;
    private String role;
    private String content;
    private String createdAt;
}