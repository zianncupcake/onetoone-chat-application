package com.onetoonechatapplication.websocket.user;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

//userservice contains business logic, acts as intermediary between controller and repository, can have additional methods that manipulate data before its passed to the repository or retrned to the controller
@Service
@RequiredArgsConstructor
public class UserService {
    // we need to have repository in order to be able to interactive with our db
    private final UserRepository repository;

    public void saveUser(User user) {
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public void disconnect(User user) {
        var storedUser = repository.findById(user.getNickName()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return repository.findAllByStatus(Status.ONLINE);
    }

    
}
