package com.personal.urlshortner.dto.auth.helper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tokens {

    private String accessToken;
    private String refreshToken;

}
