package com.onetoonechatapplication.websocket.user;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

//interacts directly with database, contains methods for crud operations
public interface UserRepository extends MongoRepository<User, String>{
    //custom query from method name --> a spring data feature
    //The method name and signature. Spring Data MongoDB will parse the method name and generate a query that finds all User entities where the status field matches the provided status parameter.
    List<User> findAllByStatus(Status status);
}
