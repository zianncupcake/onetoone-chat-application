package com.onetoonechatapplication.websocket.chat;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.onetoonechatapplication.websocket.chatroom.ChatRoomService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService.getChatRoomId(chatMessage.getSenderId(), chatMessage.getRecepientId(), true).orElseThrow();
        chatMessage.setChatId(chatId);
        repository.save(chatMessage);
        return chatMessage;                    
    }
    
    //return list of chatmessage objects representing the chat history between the 2 users
    public List<ChatMessage> findChatMessages(String senderId, String recepientId) {
        var chatId = chatRoomService.getChatRoomId(senderId, recepientId, false);
        //calls findbychatid method of the repository object AKA reposity -> repository.findbychatid
        //if chatid not present, return empty arraylist
        return chatId.map(repository::findByChatId).orElse(new ArrayList<>());
    }



}
