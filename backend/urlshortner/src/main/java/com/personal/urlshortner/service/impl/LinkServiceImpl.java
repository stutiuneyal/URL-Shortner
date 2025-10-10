package com.personal.urlshortner.service.impl;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.link.CreateLinkRequest;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.service.ILinkService;
import com.personal.urlshortner.util.SlugUtil;
import com.personal.urlshortner.repository.LinkRepository;

@Service
public class LinkServiceImpl implements ILinkService {

    @Autowired
    private LinkRepository linkRepository;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public Link createLink(String userId, CreateLinkRequest request) {

        String slug = (request.getSlug() == null || request.getSlug().isBlank()) ? SlugUtil.generateSlug(7)
                : request.getSlug();

        linkRepository.findBySlug(slug).ifPresent(link -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug already exists");
        });

        String passwordHash = (request.getPassword() == null || request.getPassword().isBlank()) ? null
                : encoder.encode(request.getPassword());

        Link link = Link.builder()
                .workspaceId(request.getWorkspaceId())
                .domainId(request.getDomainId())
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
                .createdBy(userId)
                .createdAt(Instant.now())
                .build();

        link = linkRepository.save(link);

        // add the cache for the redirector
        String cachekey = "slug:" + slug;
        redisTemplate.opsForValue().set(cachekey,
                String.format("%s|%s|%s|%s|%s", link.getTarget(), link.getExpiresAt(), link.getClickLimit(),
                        passwordHash != null, link.getId()),
                Duration.ofMinutes(5));

        return link;
    }

    @Override
    public List<Link> listAllLinksInWorkspace(String workspaceId) {
        return linkRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    @Override
    public Link updateLink(String linkId, Map<String, Object> request) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (request.containsKey("target"))
            link.setTarget((String) request.get("target"));
        if (request.containsKey("active"))
            link.setActive((Boolean) request.get("active"));
        if (request.containsKey("expiresAt"))
            link.setExpiresAt(Instant.parse((String) request.get("expiresAt")));
        if (request.containsKey("clickLimit"))
            link.setClickLimit((Integer) request.get("clickLimit"));
        link = linkRepository.save(link);

        // clear the cache
        redisTemplate.delete("slug:" + link.getSlug());
        return link;
    }

    @Override
    public Void deleteLink(String linkId) {

        linkRepository.findById(linkId).ifPresent(link -> {
            linkRepository.deleteById(linkId);

            // clear the cache
            redisTemplate.delete("slug:" + link.getSlug());
        });

        return null;
    }

    @Override
    @Async
    public void recordClick(String linkId) {

        linkRepository.findById(linkId).ifPresent(link -> {
            link.setClicks(link.getClicks() + 1);
            link.setLastClickedAt(Instant.now());
            linkRepository.save(link);
        });

    }

}
