package com.personal.urlshortner.service;

import java.util.List;
import java.util.Map;

import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.model.Link;

public interface ILinkService {

    Link createLink(String userId, CreateLinkRequest request);

    List<Link> listAllLinksInWorkspace(String userId, String workspaceId);

    Link getLinkById(String userId, String linkId);

    Link updateLink(String userId, String linkId, Map<String, Object> request);

    Void deleteLink(String userId, String linkId);

    Link pauseLink(String userId, String linkId);

    Link resumeLink(String userId, String linkId);

    Link archiveLink(String userId, String linkId);

    Link unarchiveLink(String userId, String linkId);

    void recordClick(String linkId, String referer, String userAgent, String ipAddress);

    String unlockProtectedLink(String slug, String password, String referer, String userAgent, String ipAddress);
}