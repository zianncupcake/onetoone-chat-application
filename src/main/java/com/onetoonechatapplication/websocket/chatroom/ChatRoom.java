package com.onetoonechatapplication.websocket.chatroom;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//@Data annotation generates getter and setter methods for all fields in your ChatRoom class, including getChatId.
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document

public class ChatRoom {
    @Id //field annotated with @id is used as the pri key 
    private String id;
    private String chatId;
    private String senderId;
    private String recepientId;
}

