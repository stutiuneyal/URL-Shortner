package com.personal.urlshortner.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlugSuggestionItem {
    private String slug;
    private String reason;
    private String style;
}