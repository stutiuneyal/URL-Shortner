package com.personal.urlshortner.config;


import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

import com.personal.urlshortner.rate.RateLimiterFilter;

@Configuration
public class RateLimiterConfig {

    @Bean
    public FilterRegistrationBean<RateLimiterFilter> rateLimiterRegistration(RateLimiterFilter filter){
        var reg = new FilterRegistrationBean<>(filter);
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE+10);
        return reg;
    }

}
