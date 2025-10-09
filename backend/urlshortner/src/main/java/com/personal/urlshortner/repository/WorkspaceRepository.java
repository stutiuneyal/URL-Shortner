package com.personal.urlshortner.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.personal.urlshortner.model.Workspace;

@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace,String> {

    List<Workspace> findByMembersUserId(String userId);

}
