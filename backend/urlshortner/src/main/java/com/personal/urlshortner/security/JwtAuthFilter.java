package com.personal.urlshortner.security;



import java.io.IOException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
/*
 * JwtAuthFilter -> implements the custom doFilterInternal
 * OncePerRequestFilter -> makes sure that custom filter logic is executed only once per request
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwt;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain fc) throws ServletException,IOException{
        String header = req.getHeader(HttpHeaders.AUTHORIZATION);
        if(header!=null && header.startsWith("Bearer ")){
            try{
                var jws = jwt.parseToken(header.substring(7));
                String userId = jws.getBody().getSubject();

                @SuppressWarnings("unchecked")
                var roles = (List<String>)jws.getBody().get("roles");

                var auth = new UsernamePasswordAuthenticationToken(userId, null,
                roles==null?List.of() : roles.stream().map(SimpleGrantedAuthority::new).toList());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }catch(JwtException ignore){
                ignore.printStackTrace();
            }
        }

        fc.doFilter(req, res);

    }



}
