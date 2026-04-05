package com.personal.urlshortner.dto.dns;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainResponse {
    private String id;
    private String workspaceId;
    private String hostname;
    private Instant createdAt;
    private Instant verifiedAt;
    private Instant lastCheckedAt;
    private String verificationStatus;
    private List<DnsRecordResponse> requiredDnsRecords;
}