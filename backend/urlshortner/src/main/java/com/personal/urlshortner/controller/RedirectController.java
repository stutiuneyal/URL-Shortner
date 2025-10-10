package com.personal.urlshortner.controller;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.model.Link;
import com.personal.urlshortner.repository.LinkRepository;
import com.personal.urlshortner.service.ILinkService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/r")
public class RedirectController {

    @Autowired
    private LinkRepository linkRepository;
    @Autowired
    private ILinkService linkService;
    @Autowired
    private StringRedisTemplate redisTemplate;

    @RequestMapping(value = "/{slug}", method = RequestMethod.GET)
    public ResponseEntity<?> redirectUrl(
            @PathVariable(name = "slug") String slug,
            HttpServletRequest request) {

        String redisKey = "slug:" + slug;
        String redisMeta = redisTemplate.opsForValue().get(redisKey);

        // if not in cache prepare and set the key
        if (redisMeta == null) {

            Optional<Link> opt = linkRepository.findBySlugAndActiveTrue(slug);

            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Link link = opt.get();

            String expiresStr = link.getExpiresAt() != null ? link.getExpiresAt().toString() : "";
            String clickLimitStr = link.getClickLimit() != null ? link.getClickLimit().toString() : "";
            String hasPwdStr = Boolean.toString(link.getPasswordHash() != null);

            redisMeta = String.join("|",
                    link.getTarget(),
                    expiresStr,
                    clickLimitStr,
                    hasPwdStr,
                    link.getId());

            redisTemplate.opsForValue().set(redisKey, redisMeta, Duration.ofMinutes(5));
        }

        String[] parts = redisMeta.split("\\|", -1);
        String target = parts[0];
        String expires = parts[1];
        String linkId = parts[4];

        if (expires != null && !expires.isBlank()) {
            Instant exp = Instant.parse(expires); // ISO-8601 string is fine
            if (exp.isBefore(Instant.now())) {
                return ResponseEntity.status(HttpStatus.GONE).build();
            }
        }

        // asyncronously record the click
        linkService.recordClick(linkId);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(target));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);

    }

}
