package com.personal.urlshortner.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.service.IWorkspaceService;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private IWorkspaceService workspaceService;

    /*
     * @AuthenticationPrincipal annotation automatically injects the logged-in user
     * Principal(UserDetails), without manually pulling from the SecurityContext.
     * This way we dont have to pass the userId from the frontend, it takes the
     * detail from the authenticated session/JWT
     */
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public ResponseEntity<?> createWorkspace(
            @AuthenticationPrincipal String userId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(workspaceService.createWorkspace(userId, request.get("name")));
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public ResponseEntity<?> listWorkspaces(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(workspaceService.listWorkspaces(userId));
    }

    @RequestMapping(value = "/list/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> listWorkspaceById(
            @PathVariable(name = "id") String workspaceId) {
        return ResponseEntity.ok(workspaceService.listWorkspaceById(workspaceId));
    }

}
