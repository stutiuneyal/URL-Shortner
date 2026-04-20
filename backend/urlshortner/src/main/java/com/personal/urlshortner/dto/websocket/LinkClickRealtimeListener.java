package com.personal.urlshortner.dto.websocket;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class LinkClickRealtimeListener {
    

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Async
    @EventListener
    public void handleClickRealtimeEvent(LinkClickRealtimeEvent event){
        if(event == null || event.getWorkspaceId() == null || event.getLinkId() == null){
            return;
        }

        messagingTemplate.convertAndSend(
            "/topic/workspaces/" + event.getWorkspaceId() + "/links",
            event
        );

        messagingTemplate.convertAndSend(
            "/topic/links"+event.getLinkId(),
            event
        );

        messagingTemplate.convertAndSend(
            "/topic/workspaces/"+event.getWorkspaceId()+"/dashboard",
            Map.of(
                "type","DASHBOARD_REFRESH_REQUIRED",
                "workspaceId", event.getWorkspaceId(),
                "linkId", event.getLinkId(),
                "at", event.getCreatedAt()
            )
        );
    }
}
