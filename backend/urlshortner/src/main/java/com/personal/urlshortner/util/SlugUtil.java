package com.personal.urlshortner.util;

import java.security.SecureRandom;

public final class SlugUtil {

    private static final String ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final SecureRandom RND = new SecureRandom();

    public static String generateSlug(int len){
        StringBuilder sb = new StringBuilder(len);
        for(int i=0;i<len;i++){
            sb.append(ALPHABET.charAt(RND.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

}
