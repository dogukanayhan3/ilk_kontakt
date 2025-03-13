package com.luv2code.springboot.cruddemo.service;

import com.luv2code.springboot.cruddemo.dao.UsersRepository;
import com.luv2code.springboot.cruddemo.entitiy.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsersServiceImpl implements UsersService {

    //set up field and constructor injection
    private UsersRepository usersRepository;

    @Autowired
    public UsersServiceImpl(UsersRepository theUsersRepository) {
        this.usersRepository = theUsersRepository;
    }
    @Override
    public List<Users> findAll() {
        return usersRepository.findAll();
    }

    @Override
    public Users findById(int theId) {

        Optional<Users> result = usersRepository.findById(theId);
        Users theUser = null;
        if (result.isPresent()) {
            theUser = result.get();
        }
        else {
            throw new RuntimeException("User not found - Id = " + theId);
        }
        return theUser;
    }


    @Override
    public Users save(Users theUser) {
        return usersRepository.save(theUser);
    }


    @Override
    public void deleteById(int theId) {
        usersRepository.deleteById(theId);
    }
}
