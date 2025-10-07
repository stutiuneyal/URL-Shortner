package com.personal.urlshortner.config;


import org.springframework.boot.context.properties.ConfigurationProperties;


import lombok.Data;

/*
 * ConfigurationProperties -> this helps us to bind the values from application.properties file without using @Value annotation
 * example: prefix=app, so all the values in the properties file starting with app.* can be easily mapped without agina-and-agin using @Value
 */
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private String baseUrl;
    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Rate rate = new Rate();

    @Data
    public static class Jwt{
        private String secret;
        private int accessTtlMin;
        private int refreshTtlDays;
    }

    @Data
    public static class Cors{
        private String origins;
    }

    @Data
    public static class Rate{
        private int windowSeconds;
        private int maxHits;
    }

}
