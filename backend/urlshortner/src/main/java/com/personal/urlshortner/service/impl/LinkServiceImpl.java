package com.personal.urlshortner.service.impl;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.dto.websocket.LinkClickRealtimeEvent;
import com.personal.urlshortner.dto.websocket.LinkClickRealtimePublisher;
import com.personal.urlshortner.model.ClickEvent;
import com.personal.urlshortner.model.Domain;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.model.Workspace;
import com.personal.urlshortner.model.helper.Member;
import com.personal.urlshortner.repository.ClickEventRepository;
import com.personal.urlshortner.repository.DomainRepository;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.repository.WorkspaceRepository;
import com.personal.urlshortner.service.ILinkService;
import com.personal.urlshortner.util.SlugUtil;

@Service
public class LinkServiceImpl implements ILinkService {

    private static final Duration REDIRECT_CACHE_TTL = Duration.ofMinutes(5);

    @Autowired
    private LinkRepository linkRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private ClickEventRepository clickEventRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private LinkClickRealtimePublisher linkClickRealtimePublisher;

    @Override
    public Link createLink(String userId, CreateLinkRequest request) {

        if (request.getWorkspaceId() == null || request.getWorkspaceId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "workspaceId is required");
        }

        Workspace workspace = getWorkspaceOrThrow(request.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? generateUniqueSlug()
                : request.getSlug().trim();

        linkRepository.findBySlug(slug).ifPresent(link -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        });

        String domainId = null;
        if (request.getDomainId() != null && !request.getDomainId().isBlank()) {
            Domain domain = domainRepository.findById(request.getDomainId().trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Selected domain does not exist"));

            if (!workspace.getId().equals(domain.getWorkspaceId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Selected domain does not belong to the provided workspace");
            }

            domainId = domain.getId();
        }

        String passwordHash = (request.getPassword() == null || request.getPassword().isBlank())
                ? null
                : encoder.encode(request.getPassword());

        Link link = Link.builder()
                .workspaceId(request.getWorkspaceId())
                .domainId(domainId)
                .slug(slug)
                .target(request.getTarget())
                .rules(request.getRules())
                .passwordHash(passwordHash)
                .expiresAt(request.getExpiresAt())
                .clickLimit(request.getClickLimit())
                .clicks(0L)
                .utmStrip(Boolean.TRUE.equals(request.getUtmStrip()))
                .tags(request.getTags())
                .active(true)
                .archived(false)
                .archivedAt(null)
                .archivedBy(null)
                .createdBy(userId)
                .createdAt(Instant.now())
                .build();

        link = linkRepository.save(link);
        putRedirectCache(link);

        return link;
    }

    @Override
    public List<Link> listAllLinksInWorkspace(String userId, String workspaceId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        validateWorkspaceAccess(userId, workspace);

        return linkRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    @Override
    public Link getLinkById(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);
        return link;
    }

    @Override
    public Link updateLink(String userId, String linkId, Map<String, Object> request) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        if (request.containsKey("target")) {
            link.setTarget((String) request.get("target"));
        }

        if (request.containsKey("active")) {
            link.setActive((Boolean) request.get("active"));
        }

        if (request.containsKey("expiresAt")) {
            Object expiresAt = request.get("expiresAt");
            if (expiresAt == null || String.valueOf(expiresAt).isBlank()) {
                link.setExpiresAt(null);
            } else {
                link.setExpiresAt(Instant.parse(String.valueOf(expiresAt)));
            }
        }

        if (request.containsKey("clickLimit")) {
            Object clickLimitObj = request.get("clickLimit");
            if (clickLimitObj == null || String.valueOf(clickLimitObj).isBlank()) {
                link.setClickLimit(null);
            } else if (clickLimitObj instanceof Number number) {
                link.setClickLimit(number.intValue());
            } else {
                link.setClickLimit(Integer.parseInt(String.valueOf(clickLimitObj)));
            }
        }

        if (request.containsKey("tags")) {
            Object tagsObj = request.get("tags");
            if (tagsObj instanceof List<?>) {
                List<String> tags = ((List<?>) tagsObj)
                        .stream()
                        .map(String::valueOf)
                        .collect(Collectors.toList());
                link.setTags(tags);
            } else {
                link.setTags(Collections.emptyList());
            }
        }

        link = linkRepository.save(link);
        putRedirectCache(link);

        return link;
    }

    @Override
    public Void deleteLink(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        linkRepository.deleteById(linkId);
        redisTemplate.delete(getRedisKey(link.getSlug()));
        return null;
    }

    @Override
    public Link pauseLink(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        link.setActive(false);
        link = linkRepository.save(link);
        putRedirectCache(link);
        return link;
    }

    @Override
    public Link resumeLink(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        if (Boolean.TRUE.equals(link.getArchived())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archived link cannot be resumed directly");
        }

        link.setActive(true);
        link = linkRepository.save(link);
        putRedirectCache(link);
        return link;
    }

    @Override
    public Link archiveLink(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        link.setArchived(true);
        link.setArchivedAt(Instant.now());
        link.setArchivedBy(userId);
        link.setActive(false);

        link = linkRepository.save(link);
        redisTemplate.delete(getRedisKey(link.getSlug()));
        return link;
    }

    @Override
    public Link unarchiveLink(String userId, String linkId) {
        Link link = getLinkOrThrow(linkId);
        Workspace workspace = getWorkspaceOrThrow(link.getWorkspaceId());
        validateWorkspaceAccess(userId, workspace);

        link.setArchived(false);
        link.setArchivedAt(null);
        link.setArchivedBy(null);

        link = linkRepository.save(link);
        putRedirectCache(link);
        return link;
    }

    @Override
    @Async
    public void recordClick(String linkId, String referer, String userAgent, String ipAddress) {
        linkRepository.findById(linkId).ifPresent(link -> {

            Instant now = Instant.now();

            long currentClicks = link.getClicks() == null ? 0L : link.getClicks();
            long updatedClicks = currentClicks + 1;

            link.setClicks(updatedClicks);
            link.setLastClickedAt(now);
            linkRepository.save(link);

            ClickEvent event = ClickEvent.builder()
                    .linkId(link.getId())
                    .workspaceId(link.getWorkspaceId())
                    .slug(link.getSlug())
                    .referer(normalizeReferer(referer))
                    .userAgent(userAgent)
                    .browser(resolveBrowser(userAgent))
                    .deviceType(resolveDeviceType(userAgent))
                    .country("Unknown")
                    .createdAt(now)
                    .build();

            clickEventRepository.save(event);
            redisTemplate.delete(getRedisKey(link.getSlug()));

            linkClickRealtimePublisher.publish(
                    LinkClickRealtimeEvent.builder()
                            .type("LINK_CREATED")
                            .workspaceId(link.getWorkspaceId())
                            .linkId(link.getId())
                            .slug(link.getSlug())
                            .clicks(updatedClicks)
                            .lastClickedAt(now.toString())
                            .referrer(event.getReferer())
                            .browser(event.getBrowser())
                            .deviceType(event.getDeviceType())
                            .country(event.getCountry())
                            .createdAt(now.toString())
                            .build());
        });
    }

    @Override
    public String unlockProtectedLink(String slug, String password, String referer, String userAgent,
            String ipAddress) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        Link link = linkRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        validateRedirectState(link);

        if (link.getPasswordHash() == null || link.getPasswordHash().isBlank()) {
            return link.getTarget();
        }

        if (!encoder.matches(password, link.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        long currentClicks = link.getClicks() == null ? 0L : link.getClicks();
        long nextClicks = currentClicks + 1;
        link.setClicks(nextClicks);
        link.setLastClickedAt(Instant.now());
        linkRepository.save(link);

        ClickEvent event = ClickEvent.builder()
                .linkId(link.getId())
                .workspaceId(link.getWorkspaceId())
                .slug(link.getSlug())
                .referer(normalizeReferer(referer))
                .userAgent(userAgent)
                .browser(resolveBrowser(userAgent))
                .deviceType(resolveDeviceType(userAgent))
                .country("Unknown")
                .createdAt(Instant.now())
                .build();

        clickEventRepository.save(event);

        linkClickRealtimePublisher.publish(
                LinkClickRealtimeEvent.builder()
                        .type("LINK_CLICKED")
                        .workspaceId(link.getWorkspaceId())
                        .linkId(link.getId())
                        .slug(link.getSlug())
                        .clicks(nextClicks)
                        .lastClickedAt(link.getLastClickedAt() != null ? link.getLastClickedAt().toString() : null)
                        .referrer(event.getReferer())
                        .browser(event.getBrowser())
                        .deviceType(event.getDeviceType())
                        .country(event.getCountry())
                        .createdAt(event.getCreatedAt() != null ? event.getCreatedAt().toString() : null)
                        .build());

        putRedirectCache(link);

        return link.getTarget();
    }

    private void validateRedirectState(Link link) {
        if (!Boolean.TRUE.equals(link.getActive())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Link is inactive");
        }

        if (Boolean.TRUE.equals(link.getArchived())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Link is archived");
        }

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Link has expired");
        }

        if (link.getClickLimit() != null) {
            long currentClicks = link.getClicks() == null ? 0L : link.getClicks();
            if (currentClicks >= link.getClickLimit()) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Click limit reached");
            }
        }
    }

    private Link getLinkOrThrow(String linkId) {
        return linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
    }

    private Workspace getWorkspaceOrThrow(String workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found"));
    }

    private void validateWorkspaceAccess(String userId, Workspace workspace) {
        boolean isOwner = userId != null && userId.equals(workspace.getOwnerId());

        boolean isMember = workspace.getMembers() != null
                && workspace.getMembers().stream()
                        .map(Member::getUserId)
                        .anyMatch(userId::equals);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have access to the provided workspace");
        }
    }

    private String generateUniqueSlug() {
        String slug;
        do {
            slug = SlugUtil.generateSlug(7);
        } while (linkRepository.findBySlug(slug).isPresent());
        return slug;
    }

    private void putRedirectCache(Link link) {
        redisTemplate.opsForValue().set(
                getRedisKey(link.getSlug()),
                buildRedisMeta(link),
                REDIRECT_CACHE_TTL);
    }

    private String buildRedisMeta(Link link) {
        String expiresStr = link.getExpiresAt() != null ? link.getExpiresAt().toString() : "";
        String clickLimitStr = link.getClickLimit() != null ? link.getClickLimit().toString() : "";
        String clicksStr = link.getClicks() != null ? link.getClicks().toString() : "0";
        String hasPwdStr = Boolean.toString(link.getPasswordHash() != null);
        String activeStr = Boolean.toString(Boolean.TRUE.equals(link.getActive()));
        String archivedStr = Boolean.toString(Boolean.TRUE.equals(link.getArchived()));

        return String.join("|",
                safe(link.getTarget()),
                expiresStr,
                clicksStr,
                clickLimitStr,
                hasPwdStr,
                safe(link.getId()),
                activeStr,
                archivedStr);
    }

    private String getRedisKey(String slug) {
        return "slug:" + slug;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String normalizeReferer(String referer) {
        if (referer == null || referer.isBlank())
            return "Direct";
        String lower = referer.toLowerCase();
        if (lower.contains("google."))
            return "Google";
        if (lower.contains("facebook."))
            return "Facebook";
        if (lower.contains("instagram."))
            return "Instagram";
        if (lower.contains("twitter.") || lower.contains("x.com"))
            return "X";
        if (lower.contains("linkedin."))
            return "LinkedIn";
        if (lower.contains("youtube."))
            return "YouTube";
        return referer;
    }

    private String resolveDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isBlank())
            return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("ipad") || ua.contains("tablet"))
            return "Tablet";
        if (ua.contains("mobi") || ua.contains("android") || ua.contains("iphone"))
            return "Mobile";
        return "Desktop";
    }

    private String resolveBrowser(String userAgent) {
        if (userAgent == null || userAgent.isBlank())
            return "Unknown";
        String ua = userAgent.toLowerCase();
        if (ua.contains("edg/"))
            return "Edge";
        if (ua.contains("chrome/") && !ua.contains("edg/"))
            return "Chrome";
        if (ua.contains("firefox/"))
            return "Firefox";
        if (ua.contains("safari/") && !ua.contains("chrome/"))
            return "Safari";
        if (ua.contains("opr/") || ua.contains("opera"))
            return "Opera";
        return "Other";
    }
}