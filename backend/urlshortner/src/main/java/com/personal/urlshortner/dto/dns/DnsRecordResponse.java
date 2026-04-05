package com.personal.urlshortner.dto.dns;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DnsRecordResponse {
    private String type;
    private String name;
    private String value;
}
