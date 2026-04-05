package com.personal.urlshortner.service;

import java.util.List;

import com.personal.urlshortner.dto.dns.DomainResponse;;

public interface IDomainService {

    List<DomainResponse> listDomains(String userId, String workspaceId);

    DomainResponse createDomain(String userId, String workspaceId, String hostname);

    DomainResponse verifyDomain(String userId, String domainId);

    Void deleteDomain(String userId, String domainId);
}