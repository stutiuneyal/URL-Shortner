package com.personal.urlshortner.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.ai.LinkChatMessage;

@Repository
public interface LinkChatMessageRepository extends MongoRepository<LinkChatMessage, String> {
    List<LinkChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    List<LinkChatMessage> findTop12BySessionIdOrderByCreatedAtDesc(String sessionId);
}