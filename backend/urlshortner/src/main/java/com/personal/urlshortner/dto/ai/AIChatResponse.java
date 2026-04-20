package com.personal.urlshortner.dto.ai;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIChatResponse {
    private String answer;
    private List<String> suggestedQuestions;
    private String generatedAt;
    private String model;
}