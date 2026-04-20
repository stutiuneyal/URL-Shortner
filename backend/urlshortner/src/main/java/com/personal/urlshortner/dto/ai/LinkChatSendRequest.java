package com.personal.urlshortner.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LinkChatSendRequest {

    @NotBlank(message = "Question is required")
    private String question;
}