package com.personal.urlshortner.util;

import org.springframework.security.crypto.password.PasswordEncoder;

public final class CryptoUtil {

    public static String generatePasswordHash(PasswordEncoder encoder, String rawPassword){
        return encoder.encode(rawPassword);
    }

    public static boolean matchPassword(PasswordEncoder encoder,String rawPassword,String hashedPassword){
        return encoder.matches(rawPassword, hashedPassword);
    }

}
