package com.onetoonechatapplication.websocket.user;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import java.util.List;

//controller handles http request and responses, maps url to servcie methods, primarily concerned with web layer logic
@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    //When a WebSocket client sends a message to the destination /user.addUser, this method (addUser) will be invoked.
    @MessageMapping("/user.addUser")
    //After processing the WebSocket message, the result (in this case, the User object) will be sent to the WebSocket topic /user/topic.
    @SendTo("/user/topic")
    //The incoming WebSocket message's payload will be automatically converted and bound to the User object.
    public User addUser(@Payload User user) {
        service.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user.topic")
    public User disconnect(@Payload User user) {
        service.disconnect(user);
        return user;
    }

    //@GetMapping("/users"): Maps HTTP GET requests sent to /users to this method.
    @GetMapping("/users")
    //findConnectedUsers method: Returns a list of connected users wrapped in a ResponseEntity with an HTTP 200 OK status.
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(service.findConnectedUsers());
    }
}
