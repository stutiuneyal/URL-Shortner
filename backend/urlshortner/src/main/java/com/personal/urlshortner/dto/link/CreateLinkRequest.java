package com.personal.urlshortner.dto.link;

import java.time.Instant;
import java.util.List;

import com.personal.urlshortner.model.helper.Rule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLinkRequest {

    @NotBlank
    private String workspaceId;

    private String domainId;

    @Size(min = 4,max = 32)
    private String slug;

    @NotBlank
    @Pattern(regexp = "https?://.+")
    private String target;

    private List<Rule> rules = List.of();
    private String password;
    private Instant expiresAt;
    private Integer clickLimit;
    private Boolean utmStrip = false;
    List<String> tags = List.of();
}
