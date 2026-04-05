package com.personal.urlshortner.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.service.IDomainService;

@RestController
@RequestMapping("/api/domains")
public class DomainController {

    @Autowired
    private IDomainService domainService;

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public ResponseEntity<?> listDomains(
            @AuthenticationPrincipal String userId,
            @RequestParam(name = "workspace_id") String workspaceId) {
        return ResponseEntity.ok(domainService.listDomains(userId, workspaceId));
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public ResponseEntity<?> createDomain(
            @AuthenticationPrincipal String userId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                domainService.createDomain(
                        userId,
                        request.get("workspaceId"),
                        request.get("hostname")));
    }

    @RequestMapping(value = "/verify/{id}", method = RequestMethod.POST)
    public ResponseEntity<?> verifyDomain(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String domainId) {
        return ResponseEntity.ok(domainService.verifyDomain(userId, domainId));
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteDomain(
            @AuthenticationPrincipal String userId,
            @PathVariable(name = "id") String domainId) {
        return ResponseEntity.ok(domainService.deleteDomain(userId, domainId));
    }
}