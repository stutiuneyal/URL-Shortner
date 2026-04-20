package com.personal.urlshortner.model.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightItem {
    private String title;
    private String description;
    private String priority;
    private String category;
}