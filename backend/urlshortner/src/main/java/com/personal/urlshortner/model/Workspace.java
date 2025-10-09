package com.personal.urlshortner.model;


import java.time.Instant;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.personal.urlshortner.model.helper.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document("workspaces")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workspace {

    @Id
    private String id;

    private String name;
    private String ownerId;
    private List<Member> members;
    private Instant createdAt;


}
