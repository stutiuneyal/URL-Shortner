package com.personal.urlshortner.dto.auth;

import java.util.Map;

import com.personal.urlshortner.dto.auth.helper.Tokens;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    Map<String,Object> user;
    Tokens tokens;

}
