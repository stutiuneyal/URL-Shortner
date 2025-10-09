package com.personal.urlshortner.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.Domain;

@Repository
public interface DomainRepository extends MongoRepository<Domain,String> {

    List<Domain> findByWorkspaceId(String workspaceId);
    Optional<Domain> findByWorkspaceIdAndHostname(String workspaceId,String hostname);

}
