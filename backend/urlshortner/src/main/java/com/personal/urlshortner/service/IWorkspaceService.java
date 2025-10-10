package com.personal.urlshortner.service;

import java.util.List;

import com.personal.urlshortner.model.Workspace;

public interface IWorkspaceService {

    Workspace createWorkspace(String userId, String name);

    List<Workspace> listWorkspaces(String userId);

    Workspace listWorkspaceById(String workspaceId);

}
