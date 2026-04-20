package com.personal.urlshortner.dto.ai;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlugSuggestionResponse {
    private List<SlugSuggestionItem> suggestions;
}