package com.personal.urlshortner.rate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.ReturnType;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.personal.urlshortner.config.AppProperties;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
public class RateLimiterFilter extends OncePerRequestFilter {

    @Autowired
    private StringRedisTemplate redisTemplate;
    @Autowired
    private AppProperties props;

    /*
     * https://medium.com/@ramachandrankrish/rate-limiting-in-redis-using-lua-script-61774e74e270
     * We are using LUA because LUA scripts allow us to to evaluate data within
     * Redis and make decisions based on the parameters you pass and the stored
     * data.
     * This means that logic that would have been executed within your microservice
     * could be instead be executed inside Redis.
     */
    private static final String LUA = """
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local window = tonumber(ARGV[2])
            local max = tonumber(ARGV[3])
            redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
            redis.call('ZADD', key, now, tostring(now))
            redis.call('EXPIRE', key, window)
            local count = redis.call('ZCARD', key)
            return count
            """;

    @Override
    public boolean shouldNotFilter(HttpServletRequest req) {
        String path = req.getServletPath();
        return path.startsWith("/r/") || path.equals("/health");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain filterChain)
            throws ServletException, IOException {
        String ip = Optional.ofNullable(req.getHeader("X-Forwarded-For")).orElse(req.getRemoteAddr());
        String key = "rl:ip:" + ip;
        Long now = Instant.now().getEpochSecond();
        Long cnt = redisTemplate
                .execute((RedisCallback<Long>) con -> con.scriptingCommands().eval(LUA.getBytes(StandardCharsets.UTF_8),
                        ReturnType.INTEGER, 1,
                        key.getBytes(StandardCharsets.UTF_8),
                        now.toString().getBytes(StandardCharsets.UTF_8),
                        String.valueOf(props.getRate().getWindowSeconds()).getBytes(StandardCharsets.UTF_8),
                        String.valueOf(props.getRate().getMaxHits()).getBytes(StandardCharsets.UTF_8)));
        res.setHeader("X-RateLimit-Limit", String.valueOf(props.getRate().getMaxHits()));
        res.setHeader("X-RateLimit-Remaining",
                String.valueOf(Math.max(0, props.getRate().getMaxHits() - (cnt == null ? 0 : cnt))));
        if (cnt != null && cnt > props.getRate().getMaxHits()) {
            res.setStatus(429);
            res.setContentType("application/json");
            res.getWriter().write("{\"ok\":false,\"error\":\"Too Many Requests\"}");
            return;
        }
        filterChain.doFilter(req, res);
    }

}
