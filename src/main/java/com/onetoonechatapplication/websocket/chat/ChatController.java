package com.onetoonechatapplication.websocket.chat;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    //handles messages sent to the /chat destination
    //chatMessage parameter should be bound to the payload of the incoming message
    @MessageMapping("/chat")
    //why payload? when a message is sent it includes headers(optional) and payload. payload annotation means actual content of message deserialised into sepcific parameter type
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage savedMsg = chatMessageService.save(chatMessage);
        //john will be subscribed to the queue john/queue/messages
        //send the message to john's queue
        //create notification
        messagingTemplate.convertAndSendToUser(
            chatMessage.getRecepientId(), 
            "/queue/messages", 
            ChatNotification.builder()
                .id(savedMsg.getId())
                .senderId(savedMsg.getSenderId())
                .recepientId(savedMsg.getRecepientId())
                .content(savedMsg.getContent())
                .build()
        );
    }

    @GetMapping("/messages/{senderId}/{recepientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(
        @PathVariable("senderId") String senderId,
        @PathVariable("recepientId") String recepientId
    ) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId, recepientId));
    }
    
}
