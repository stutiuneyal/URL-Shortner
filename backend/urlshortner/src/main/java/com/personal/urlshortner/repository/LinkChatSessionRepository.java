package com.personal.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.ai.LinkChatSession;

@Repository
public interface LinkChatSessionRepository extends MongoRepository<LinkChatSession, String> {
    Optional<LinkChatSession> findTopByLinkIdAndUserIdOrderByUpdatedAtDesc(String linkId, String userId);
}