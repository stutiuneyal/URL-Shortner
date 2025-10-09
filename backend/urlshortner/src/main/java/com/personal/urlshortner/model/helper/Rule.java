package com.personal.urlshortner.model.helper;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rule {

    private String type;
    private Map<String,Object> value;
    private String target;

}
