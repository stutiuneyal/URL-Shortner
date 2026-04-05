package com.personal.urlshortner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private String baseUrl;
    private String publicWebUrl;
    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Rate rate = new Rate();
    private Geo geo = new Geo();

    @Data
    public static class Jwt {
        private String secret;
        private int accessTtlMin;
        private int refreshTtlDays;
    }

    @Data
    public static class Cors {
        private String origins;
    }

    @Data
    public static class Rate {
        private int windowSeconds;
        private int maxHits;
    }

    @Data
    public static class Geo {
        private boolean enabled;
        private String databasePath;
    }
}