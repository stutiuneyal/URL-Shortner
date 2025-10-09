package com.personal.urlshortner.service;

import com.personal.urlshortner.dto.auth.AuthResponse;
import com.personal.urlshortner.dto.auth.LoginRequest;
import com.personal.urlshortner.dto.auth.RegisterRequest;


public interface IAuthService {

    AuthResponse registerUser(RegisterRequest request);

    AuthResponse loginUser(LoginRequest request);
    
}
