package com.personal.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.Link;
import java.util.List;


@Repository
public interface LinkRepository extends MongoRepository<Link,String> {

    Optional<Link> findBySlugAndActiveTrue(String slug);
    Optional<Link> findBySlug(String slug);
    List<Link> findByWorkspaceIdOrderByCreatedAtDesc(String workspaceId);


}
