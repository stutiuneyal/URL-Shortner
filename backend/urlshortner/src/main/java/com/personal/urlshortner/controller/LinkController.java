package com.personal.urlshortner.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.ai.SlugSuggestionRequest;
import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.ILinkService;
import com.personal.urlshortner.service.ai.AIServiceClient;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    @Autowired
    private ILinkService linkService;

    @Autowired
    private AIServiceClient aiServiceClient;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public ResponseEntity<?> createLink(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateLinkRequest request) {
        return ResponseEntity.ok(linkService.createLink(userId, request));
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public ResponseEntity<?> listAllLinksInWorkspace(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "workspace_id") String workspaceId) {
        return ResponseEntity.ok(linkService.listAllLinksInWorkspace(userId, workspaceId));
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.getLinkById(userId, linkId));
    }

    @RequestMapping(value = "/update/{id}", method = RequestMethod.PATCH)
    public ResponseEntity<?> updateLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(linkService.updateLink(userId, linkId, request));
    }

    @RequestMapping(value = "/{id}/pause", method = RequestMethod.POST)
    public ResponseEntity<?> pauseLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.pauseLink(userId, linkId));
    }

    @RequestMapping(value = "/{id}/resume", method = RequestMethod.POST)
    public ResponseEntity<?> resumeLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.resumeLink(userId, linkId));
    }

    @RequestMapping(value = "/{id}/archive", method = RequestMethod.POST)
    public ResponseEntity<?> archiveLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.archiveLink(userId, linkId));
    }

    @RequestMapping(value = "/{id}/unarchive", method = RequestMethod.POST)
    public ResponseEntity<?> unarchiveLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.unarchiveLink(userId, linkId));
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> deleteLink(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.deleteLink(userId, linkId));
    }

    @RequestMapping(value = "/slug-suggestions", method = RequestMethod.POST)
    public ResponseEntity<?> getSlugSuggestions(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SlugSuggestionRequest request) {
        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));

        boolean isMember = workspace.getMembers() != null
                && workspace.getMembers().stream().anyMatch(member -> userId.equals(member.getUserId()));

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this workspace");
        }

        return ResponseEntity.ok(aiServiceClient.suggestSlugs(request));
    }
}