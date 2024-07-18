package com.onetoonechatapplication.websocket.chatroom;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Optional;


@Service
@RequiredArgsConstructor

public class ChatRoomService {
    //reference to the repository. marked as final because it is initialised via dependency injection and should not be changed
    private final ChatRoomRepository chatRoomRepository;

    //return type is an optional containing chat room id if found or empty optional if no chat room found
    public Optional<String> getChatRoomId(
        String senderId,
        String recepientId,
        boolean createNewRoomIfNotExists
    ) {
        return chatRoomRepository
                .findBySenderIdAndRecepientId(senderId, recepientId) //find a ChatRoom entity with specified sender and recepient ids
                //map method is a feature of the optional class. used to transform the value inside the optional if it is present
                .map(ChatRoom::getChatId) //if chatroom found, map function used to transform chatroom object into its chatid. result wrapped in an optional AKA chatRoom -> chatRoom.getChatId()
                .or(() -> {
                    if (createNewRoomIfNotExists) {
                        var chatId = createChatId(senderId, recepientId);
                        return Optional.of(chatId);
                    }
                    return Optional.empty();
                });

    }

    private String createChatId(String senderId, String recepientId) {
        var chatId = String.format("%s_%s", senderId, recepientId);
        //2 chatrooms created
        ChatRoom senderRecepient = ChatRoom.builder().chatId(chatId).senderId(senderId).recepientId(recepientId).build();
        ChatRoom recepientSender = ChatRoom.builder().chatId(chatId).senderId(recepientId).recepientId(senderId).build();
        chatRoomRepository.save(senderRecepient);
        chatRoomRepository.save(recepientSender);

        return chatId;
    }
}
