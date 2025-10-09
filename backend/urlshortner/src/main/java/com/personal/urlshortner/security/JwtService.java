package com.personal.urlshortner.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.personal.urlshortner.config.AppProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service

public class JwtService {

    @Autowired
    private AppProperties props;

    // generate access token
    public String generateAccessToken(String sub, List<String> roles){
        return Jwts.builder().setSubject(sub).claim("roles", roles)
        .setIssuedAt(new Date())
        .setExpiration(Date.from(Instant.now().plus(props.getJwt().getAccessTtlMin(),ChronoUnit.MINUTES)))
        .signWith(Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8)),SignatureAlgorithm.HS256)
        .compact();
    }


    // generate the refresh token, that will be used to generate a new access token once the older has expired
    public String generateRefreshToken(String sub){
        return Jwts.builder().setSubject(sub)
        .setIssuedAt(new Date())
        .setExpiration(Date.from(Instant.now().plus(props.getJwt().getRefreshTtlDays(),ChronoUnit.DAYS)))
        .signWith(Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8)),SignatureAlgorithm.HS256)
        .compact();
    }

    // token parser
    public Jws<Claims> parseToken(String token){
        return Jwts.parserBuilder()
        .setSigningKey(Keys.hmacShaKeyFor(props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8)))
        .build().parseClaimsJws(token);
    }
}
