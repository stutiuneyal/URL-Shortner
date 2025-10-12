package com.personal.urlshortner.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.personal.urlshortner.service.IAnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private IAnalyticsService analyticsService;

    @RequestMapping(value = "/summary",method = RequestMethod.GET)
    public ResponseEntity<?> getSummary(
        @RequestParam(name = "workspace_id") String worspaceId
    ){
        return ResponseEntity.ok(analyticsService.getAnalytics(worspaceId));
    }
    
}
