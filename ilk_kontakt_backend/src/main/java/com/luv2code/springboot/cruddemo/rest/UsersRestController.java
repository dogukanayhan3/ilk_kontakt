package com.luv2code.springboot.cruddemo.rest;

import com.luv2code.springboot.cruddemo.entitiy.Users;
import com.luv2code.springboot.cruddemo.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UsersRestController {
    //define the field
    private UsersService usersService;

    @Autowired
    public UsersRestController(UsersService theUserService) {
        usersService = theUserService;
    }

    //expose "/users" and return a list of users
    @GetMapping("/users")
    public List<Users> findAll() {
        return usersService.findAll();
    }

    //add mapping for GET /users/{userId}
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/users/{userId}")
    public Users getUser(@PathVariable int userId) {
        Users theUser = usersService.findById(userId);

        if (theUser == null) {
            throw new RuntimeException("User with id " + userId + " not found");
        }
        return theUser;
    }

    //add mapping for POST /users - add new user
    //USED POST MAPPING
    @PostMapping("/users")
    public Users addUser(@RequestBody Users theUser) {

        //in case they pass an id in JSON, set id to 0
        //this forces a save of new item instead of an update
        theUser.setUserId(0);
        Users dbUser = usersService.save(theUser);
        return dbUser;
    }

    //add mapping for PUT /users - update existing user
    @PutMapping("/users")
    public Users updateUser(@RequestBody Users theUser) {
        Users dbUser = usersService.save(theUser);
        return dbUser;
    }

    //add mapping for DELETE /users/{userId} - delete user
    @DeleteMapping("/users/{userId}")
    public String deleteUser(@PathVariable int userId) {
        Users tempUser = usersService.findById(userId);

        if (tempUser == null) {
            throw new RuntimeException("User with id " + userId + " not found");
        }
        usersService.deleteById(userId);
        return "User with id " + userId + " deleted";
    }
}