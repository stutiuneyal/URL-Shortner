package com.personal.urlshortner.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.ClickEvent;

@Repository
public interface ClickEventRepository extends MongoRepository<ClickEvent, String> {

    List<ClickEvent> findByWorkspaceIdAndCreatedAtBetween(String workspaceId, Instant start, Instant end);

    List<ClickEvent> findByWorkspaceId(String workspaceId);

    List<ClickEvent> findByLinkId(String linkId);
}