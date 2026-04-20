package com.personal.urlshortner.model.ai;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("link_chat_messages")
public class LinkChatMessage {

    @Id
    private String id;

    private String sessionId;
    private String linkId;
    private String workspaceId;
    private String userId;

    private String role; // user / assistant
    private String content;
    private Instant createdAt;
}