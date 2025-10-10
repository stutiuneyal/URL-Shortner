package com.personal.urlshortner.service;

import java.util.List;
import java.util.Map;

import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.model.Link;

public interface ILinkService {

    Link createLink(String userId, CreateLinkRequest request);

    List<Link> listAllLinksInWorkspace(String workspaceId);

    Link updateLink(String linkId, Map<String, Object> request);

    Void deleteLink(String linkId);

    void recordClick(String linkId);

}
