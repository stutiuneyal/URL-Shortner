package com.personal.urlshortner.dto.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class LinkClickRealtimePublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    public void publish(LinkClickRealtimeEvent event) {
        applicationEventPublisher.publishEvent(event);
    }
}
