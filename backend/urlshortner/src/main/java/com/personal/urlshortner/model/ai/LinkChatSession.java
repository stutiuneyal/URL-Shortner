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
@Document("link_chat_sessions")
public class LinkChatSession {

    @Id
    private String id;

    private String linkId;
    private String workspaceId;
    private String userId;

    private Instant createdAt;
    private Instant updatedAt;
}