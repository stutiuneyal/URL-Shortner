package com.personal.urlshortner.dto.auth;


import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    //@JsonProperty("user-name")
    private String name;
    @Email
    private String email;
    private String password;

}
