package com.personal.urlshortner.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
@EnableConfigurationProperties(AppProperties.class)
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(){
        // the host and the port will be taken from spring.data.redis.*
        return new LettuceConnectionFactory();
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(LettuceConnectionFactory f){
        return new StringRedisTemplate(f);
    }

}
