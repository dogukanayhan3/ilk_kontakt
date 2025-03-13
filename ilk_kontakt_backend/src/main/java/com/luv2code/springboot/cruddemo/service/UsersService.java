package com.luv2code.springboot.cruddemo.service;

import com.luv2code.springboot.cruddemo.entitiy.Users;

import java.util.List;

public interface UsersService {

    List<Users> findAll();

    Users findById(int theId);

    Users save(Users theEmployee);

    void deleteById(int theId);
}
