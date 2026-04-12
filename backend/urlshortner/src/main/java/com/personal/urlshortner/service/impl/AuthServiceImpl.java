package com.personal.urlshortner.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.auth.AuthResponse;
import com.personal.urlshortner.dto.auth.LoginRequest;
import com.personal.urlshortner.dto.auth.RefreshTokenRequest;
import com.personal.urlshortner.dto.auth.RegisterRequest;
import com.personal.urlshortner.dto.auth.helper.Tokens;
import com.personal.urlshortner.model.User;
import com.personal.urlshortner.repository.UserRepository;
import com.personal.urlshortner.security.JwtService;
import com.personal.urlshortner.service.IAuthService;
import com.personal.urlshortner.util.CryptoUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;

@Service
public class AuthServiceImpl implements IAuthService {

        @Autowired
        private UserRepository userRepository;
        @Autowired
        private PasswordEncoder encoder;
        @Autowired
        private JwtService jwtService;

        @Override
        @Transactional
        public AuthResponse registerUser(RegisterRequest request) {
                userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
                });

                User user = User.builder()
                                .email(request.getEmail())
                                .name(request.getName())
                                .passwordHash(encoder.encode(request.getPassword()))
                                .roles(List.of("owner"))
                                .createdAt(Instant.now())
                                .build();

                user = userRepository.save(user);

                return buildAuthResponse(user, true);

        }

        @Override
        @Transactional
        public AuthResponse loginUser(LoginRequest request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                                "Email is not registered"));

                if (!CryptoUtil.matchPassword(encoder, request.getPassword(), user.getPasswordHash())) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
                }

                // generate auth token
                return buildAuthResponse(user, true);

        }

        @Override
        public AuthResponse refreshAccessToken(RefreshTokenRequest request) {
                try {
                        Jws<Claims> jws = jwtService.parseToken(request.getRefreshToken());
                        String userId = jws.getBody().getSubject();

                        User user = userRepository.findById(userId)
                                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                                        "Session is no longer valid"));

                        return buildAuthResponse(user, false, request.getRefreshToken());
                } catch (JwtException ex) {
                        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                                        "Refresh token is invalid or expired.");
                }
        }

        private AuthResponse buildAuthResponse(User user, boolean includeFreshRefreshToken) {
                String refreshToken = includeFreshRefreshToken
                                ? jwtService.generateRefreshToken(user.getId())
                                : null;

                return buildAuthResponse(user, includeFreshRefreshToken, refreshToken);
        }

        private AuthResponse buildAuthResponse(User user, boolean includeRefreshToken, String refreshToken) {
                Long accessTokenExpiresAt = jwtService.getAccessTokenExpiryEpochMillis();

                Tokens tokens = new Tokens(
                                jwtService.generateAccessToken(user.getId(), user.getRoles()),
                                includeRefreshToken ? refreshToken : null,
                                accessTokenExpiresAt);

                return new AuthResponse(
                                Map.of(
                                                "id", user.getId(),
                                                "email", user.getEmail(),
                                                "name", user.getName(),
                                                "roles", user.getRoles()),
                                tokens);
        }

}
