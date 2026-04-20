package com.personal.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.ai.LinkInsight;

@Repository
public interface LinkInsightRepository extends MongoRepository<LinkInsight, String> {
    Optional<LinkInsight> findTopByLinkIdOrderByGeneratedAtDesc(String linkId);
}