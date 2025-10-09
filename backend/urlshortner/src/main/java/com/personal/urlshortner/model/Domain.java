package com.personal.urlshortner.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("domains")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Domain {

    @Id
    private String id;

    @Indexed
    private String workspaceId;
    @Indexed
    private String hostname;

    private Instant verifiedAt;
    private Instant createdAt;

}
