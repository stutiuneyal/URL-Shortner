package com.personal.urlshortner.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.personal.urlshortner.dto.auth.AuthResponse;
import com.personal.urlshortner.dto.auth.LoginRequest;
import com.personal.urlshortner.dto.auth.RegisterRequest;
import com.personal.urlshortner.dto.auth.helper.Tokens;
import com.personal.urlshortner.model.User;
import com.personal.urlshortner.repository.UserRepository;
import com.personal.urlshortner.security.JwtService;
import com.personal.urlshortner.service.IAuthService;
import com.personal.urlshortner.util.CryptoUtil;

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

        // generate auth token
        Tokens tokens = new Tokens(
                jwtService.generateAccessToken(user.getId(), user.getRoles()),
                jwtService.generateRefreshToken(user.getId()));

        return new AuthResponse(
                Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "roles", user.getRoles()),
                tokens);

    }

    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email is not registered"));

        if (!CryptoUtil.matchPassword(encoder, request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        // generate auth token
        Tokens tokens = new Tokens(
                jwtService.generateAccessToken(user.getId(), user.getRoles()),
                jwtService.generateRefreshToken(user.getId()));

        return new AuthResponse(
                Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName(), "roles", user.getRoles()),
                tokens);

    }

}
