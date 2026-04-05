package com.personal.urlshortner.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "domains")
public class Domain {

    @Id
    private String id;

    @Indexed
    private String workspaceId;
    private String hostname;

    private String verificationToken;
    private String cnameTarget;

    private Instant createdAt;
    private Instant verifiedAt;
    private Instant lastCheckedAt;

    private String verificationStatus;
}