package com.personal.urlshortner.controller;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.config.AppProperties;
import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.service.ILinkService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/r")
public class RedirectController {

    private static final Duration REDIRECT_CACHE_TTL = Duration.ofMinutes(5);

    @Autowired
    private LinkRepository linkRepository;

    @Autowired
    private ILinkService linkService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private AppProperties props;

    @RequestMapping(value = "/{slug}", method = RequestMethod.GET)
    public ResponseEntity<?> redirectUrl(
            @PathVariable(name = "slug") String slug,
            HttpServletRequest request) {

        String redisKey = getRedisKey(slug);
        String redisMeta = redisTemplate.opsForValue().get(redisKey);

        if (redisMeta == null || redisMeta.isBlank()) {
            Optional<Link> opt = linkRepository.findBySlugAndActiveTrue(slug);

            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Link link = opt.get();
            redisMeta = buildRedisMeta(link);
            redisTemplate.opsForValue().set(redisKey, redisMeta, REDIRECT_CACHE_TTL);
        }

        String[] parts = redisMeta.split("\\|", -1);

        if (parts.length < 8) {
            redisTemplate.delete(redisKey);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        String target = parts[0];
        String expires = parts[1];
        long currentClicks = parseLong(parts[2], 0L);
        Integer clickLimit = parseInteger(parts[3]);
        boolean hasPassword = Boolean.parseBoolean(parts[4]);
        String linkId = parts[5];
        boolean active = Boolean.parseBoolean(parts[6]);
        boolean archived = Boolean.parseBoolean(parts[7]);

        if (archived) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (!active) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (expires != null && !expires.isBlank()) {
            Instant exp = Instant.parse(expires);
            if (exp.isBefore(Instant.now())) {
                redisTemplate.delete(redisKey);
                return ResponseEntity.status(HttpStatus.GONE).build();
            }
        }

        if (clickLimit != null && currentClicks >= clickLimit) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        if (hasPassword) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(buildUnlockUrl(slug)));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        long nextClicks = currentClicks + 1;
        String updatedRedisMeta = String.join("|",
                target,
                expires,
                String.valueOf(nextClicks),
                clickLimit == null ? "" : String.valueOf(clickLimit),
                String.valueOf(hasPassword),
                linkId,
                String.valueOf(active),
                String.valueOf(archived));

        redisTemplate.opsForValue().set(redisKey, updatedRedisMeta, REDIRECT_CACHE_TTL);

        linkService.recordClick(
                linkId,
                request.getHeader("Referer"),
                request.getHeader("User-Agent"),null);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(target));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @RequestMapping(value = "/{slug}/unlock", method = RequestMethod.POST)
    public ResponseEntity<?> unlockProtectedLink(
            @PathVariable(name = "slug") String slug,
            @RequestBody Map<String, String> request,
            @RequestHeader(name = "User-Agent", required = false) String headerUserAgent,
            @RequestHeader(name = "Referer", required = false) String headerReferer) {

        String password = request.get("password");
        String userAgent = request.getOrDefault("userAgent", headerUserAgent);
        String referer = request.getOrDefault("referer", headerReferer);

        String target = linkService.unlockProtectedLink(slug, password, referer, userAgent,null);

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "target", target));
    }

    private String buildUnlockUrl(String slug) {
        String webUrl = props.getPublicWebUrl();
        if (webUrl == null || webUrl.isBlank()) {
            webUrl = "http://localhost:5173";
        }

        if (webUrl.endsWith("/")) {
            webUrl = webUrl.substring(0, webUrl.length() - 1);
        }

        return webUrl + "/unlock/" + slug;
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

    private long parseLong(String value, long fallback) {
        try {
            return Long.parseLong(value);
        } catch (Exception ex) {
            return fallback;
        }
    }

    private Integer parseInteger(String value) {
        try {
            if (value == null || value.isBlank()) return null;
            return Integer.parseInt(value);
        } catch (Exception ex) {
            return null;
        }
    }
}