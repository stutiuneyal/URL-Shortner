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

import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.service.ILinkService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    @Autowired
    private ILinkService linkService;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public ResponseEntity<?> createLink(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateLinkRequest request) {
        return ResponseEntity.ok(linkService.createLink(userId, request));
    }

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public ResponseEntity<?> listAllLinksInWorkspace(
            @RequestParam(name = "workspace_id") String workspaceId) {
        return ResponseEntity.ok(linkService.listAllLinksInWorkspace(workspaceId));
    }

    @RequestMapping(value = "/update/{id}", method = RequestMethod.PATCH)
    public ResponseEntity<?> updateLink(
            @PathVariable(name = "id") String linkId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(linkService.updateLink(linkId, request));
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<?> deleteLink(
            @PathVariable(name = "id") String linkId) {
        return ResponseEntity.ok(linkService.deleteLink(linkId));
    }

}
