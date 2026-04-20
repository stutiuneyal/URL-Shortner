package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIInsightItemDTO {
    private String title;
    private String description;
    private String priority;
    private String category;
}