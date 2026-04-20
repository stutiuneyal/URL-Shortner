package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentClickItemDTO {
    private String createdAt;
    private String referer;
    private String browser;
    private String deviceType;
    private String country;
}