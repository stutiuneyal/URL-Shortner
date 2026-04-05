package com.personal.urlshortner.service.impl;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.xbill.DNS.CNAMERecord;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.Name;
import org.xbill.DNS.Resolver;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.TXTRecord;
import org.xbill.DNS.Type;

import com.personal.urlshortner.dto.dns.DnsRecordResponse;
import com.personal.urlshortner.dto.dns.DomainResponse;
import com.personal.urlshortner.model.Domain;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.helper.Member;
import com.personal.urlshortner.repository.DomainRepository;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.IDomainService;

@Service
public class DomainServiceImpl implements IDomainService {

    private static final String PLATFORM_CNAME_TARGET = "app.urlshortner.yourdomain.com.";
    private static final String TXT_PREFIX = "urlshortner-verify=";

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public List<DomainResponse> listDomains(String userId, String workspaceId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceAccess(userId, workspace);

        return domainRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId)
                .stream()
                .sorted(Comparator.comparing(Domain::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DomainResponse createDomain(String userId, String workspaceId, String hostname) {
        if (workspaceId == null || workspaceId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "workspaceId is required");
        }

        if (hostname == null || hostname.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "hostname is required");
        }

        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceAccess(userId, workspace);

        String normalizedHostname = normalizeHostname(hostname);

        domainRepository.findByWorkspaceIdAndHostname(workspaceId, normalizedHostname).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Domain already exists in this workspace");
        });

        Domain domain = Domain.builder()
                .workspaceId(workspaceId)
                .hostname(normalizedHostname)
                .verificationToken(generateVerificationToken())
                .cnameTarget(PLATFORM_CNAME_TARGET)
                .createdAt(Instant.now())
                .verifiedAt(null)
                .lastCheckedAt(null)
                .verificationStatus("Pending DNS verification")
                .build();

        Domain saved = domainRepository.save(domain);
        return toResponse(saved);
    }

    @Override
    public DomainResponse verifyDomain(String userId, String domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Domain not found"));

        Workspace workspace = getWorkspaceOrThrow(domain.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        VerificationResult result = checkDns(domain);

        domain.setLastCheckedAt(Instant.now());

        if (result.verified()) {
            if (domain.getVerifiedAt() == null) {
                domain.setVerifiedAt(Instant.now());
            }
            domain.setVerificationStatus("Verified");
        } else {
            domain.setVerifiedAt(null);
            domain.setVerificationStatus(result.message());
        }

        Domain saved = domainRepository.save(domain);
        return toResponse(saved);
    }

    @Override
    public Void deleteDomain(String userId, String domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Domain not found"));

        Workspace workspace = getWorkspaceOrThrow(domain.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        domainRepository.deleteById(domainId);
        return null;
    }

    private VerificationResult checkDns(Domain domain) {
        String expectedTxt = TXT_PREFIX + domain.getVerificationToken();
        String txtHost = "_verify." + domain.getHostname();
        String cnameHost = domain.getHostname();

        try {
            Resolver resolver = new SimpleResolver("8.8.8.8");
            resolver.setTimeout(Duration.ofSeconds(5));

            Lookup txtLookup = new Lookup(ensureAbsoluteName(txtHost), Type.TXT);
            txtLookup.setResolver(resolver);
            txtLookup.setCache(null);
            org.xbill.DNS.Record[] txtRecords = txtLookup.run();

            logLookup("TXT", txtHost, txtLookup, txtRecords);

            Lookup cnameLookup = new Lookup(ensureAbsoluteName(cnameHost), Type.CNAME);
            cnameLookup.setResolver(resolver);
            cnameLookup.setCache(null);
            org.xbill.DNS.Record[] cnameRecords = cnameLookup.run();

            logLookup("CNAME", cnameHost, cnameLookup, cnameRecords);

            boolean txtMatched = matchTxtRecord(txtRecords, expectedTxt);
            boolean cnameMatched = matchCnameRecord(cnameRecords, domain.getCnameTarget());

            if (txtMatched && cnameMatched) {
                return new VerificationResult(true, "Verified");
            }

            if (!txtMatched && !cnameMatched) {
                return new VerificationResult(false,
                        "TXT and CNAME records are present in DNS lookup path mismatch or incorrect");
            }

            if (!txtMatched) {
                return new VerificationResult(false, "TXT verification record is missing or incorrect");
            }

            return new VerificationResult(false, "CNAME record is missing or incorrect");
        } catch (Exception e) {
            e.printStackTrace();
            return new VerificationResult(false, "DNS lookup failed: " + e.getMessage());
        }
    }

    private boolean matchTxtRecord(org.xbill.DNS.Record[] txtRecords, String expectedTxt) {
        if (txtRecords == null || txtRecords.length == 0)
            return false;

        for (org.xbill.DNS.Record record : txtRecords) {
            if (record instanceof TXTRecord txtRecord) {
                @SuppressWarnings("unchecked")
                List<String> strings = txtRecord.getStrings();
                String joined = String.join("", strings).trim();
                if (expectedTxt.trim().equals(joined)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean matchCnameRecord(org.xbill.DNS.Record[] cnameRecords, String expectedTarget) {
        if (cnameRecords == null || cnameRecords.length == 0)
            return false;

        for (org.xbill.DNS.Record record : cnameRecords) {
            if (record instanceof CNAMERecord cnameRecord) {
                String actual = normalizeDnsValue(cnameRecord.getTarget().toString());
                String expected = normalizeDnsValue(expectedTarget);
                if (actual.equals(expected)) {
                    return true;
                }
            }
        }
        return false;
    }

    private void logLookup(String label, String host, Lookup lookup, org.xbill.DNS.Record[] records) {
        System.out.println("----- " + label + " -----");
        System.out.println("Host: " + host);
        System.out.println("Result: " + lookup.getResult());
        System.out.println("Error: " + lookup.getErrorString());
        System.out.println("Records: " + (records == null ? "null" : records.length));
        if (records != null) {
            for (org.xbill.DNS.Record record : records) {
                System.out.println("Record: " + record);
            }
        }
    }

    private DomainResponse toResponse(Domain domain) {
        return DomainResponse.builder()
                .id(domain.getId())
                .workspaceId(domain.getWorkspaceId())
                .hostname(domain.getHostname())
                .createdAt(domain.getCreatedAt())
                .verifiedAt(domain.getVerifiedAt())
                .lastCheckedAt(domain.getLastCheckedAt())
                .verificationStatus(domain.getVerificationStatus())
                .requiredDnsRecords(buildDnsRecords(domain))
                .build();
    }

    private List<DnsRecordResponse> buildDnsRecords(Domain domain) {
        List<DnsRecordResponse> records = new ArrayList<>();

        records.add(DnsRecordResponse.builder()
                .type("TXT")
                .name("_verify." + domain.getHostname())
                .value(TXT_PREFIX + domain.getVerificationToken())
                .build());

        records.add(DnsRecordResponse.builder()
                .type("CNAME")
                .name(domain.getHostname())
                .value(domain.getCnameTarget())
                .build());

        return records;
    }

    private Workspace getWorkspaceOrThrow(String workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));
    }

    private void validateWorkspaceAccess(String userId, Workspace workspace) {
        boolean isMember = workspace.getMembers() != null
                && workspace.getMembers()
                        .stream()
                        .map(Member::getUserId)
                        .anyMatch(userId::equals);

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this workspace");
        }
    }

    private String normalizeHostname(String hostname) {
        String normalized = hostname.trim().toLowerCase();

        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Hostname should not include http:// or https://");
        }

        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }

        if (!normalized.matches("^(?!://)([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid hostname");
        }

        return normalized;
    }

    private String generateVerificationToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Name ensureAbsoluteName(String host) throws Exception {
        return Name.fromString(host.endsWith(".") ? host : host + ".");
    }

    private String normalizeDnsValue(String value) {
        if (value == null)
            return "";
        return value.trim().toLowerCase().endsWith(".")
                ? value.trim().toLowerCase()
                : value.trim().toLowerCase() + ".";
    }

    private record VerificationResult(boolean verified, String message) {
    }
}