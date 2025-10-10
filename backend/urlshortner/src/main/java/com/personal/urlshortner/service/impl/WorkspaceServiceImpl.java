package com.personal.urlshortner.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.helper.Member;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.IWorkspaceService;

@Service
public class WorkspaceServiceImpl implements IWorkspaceService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Override
    public Workspace createWorkspace(String userId, String name) {

        Workspace workspace = Workspace.builder()
                .name(name)
                .ownerId(userId)
                .members(List.of(new Member(userId, "owner")))
                .createdAt(Instant.now())
                .build();

        return workspaceRepository.save(workspace);

    }

    @Override
    public List<Workspace> listWorkspaces(String userId) {
        return workspaceRepository.findByMembersUserId(userId);
    }

    @Override
    public Workspace listWorkspaceById(String workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
