package com.luv2code.springboot.cruddemo.dao;

import com.luv2code.springboot.cruddemo.entitiy.Users;
import org.springframework.data.jpa.repository.JpaRepository;

//entity type, primary key = args
public interface UsersRepository extends JpaRepository<Users, Integer> {
    //no need to write any code, any implementation class
}
