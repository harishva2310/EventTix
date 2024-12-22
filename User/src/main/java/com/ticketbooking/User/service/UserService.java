package com.ticketbooking.User.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ticketbooking.User.dao.UserRepository;
import com.ticketbooking.User.entity.User;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User upsertUser(User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());
        
        if (existingUser != null) {
            if (user.getFirstName() != null) {
                existingUser.setFirstName(user.getFirstName());
            }
            if (user.getLastName() != null) {
                existingUser.setLastName(user.getLastName());
            }
            if (user.getAddress() != null) {
                existingUser.setAddress(user.getAddress());
            }
            if (user.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(user.getPhoneNumber());
            }
            return userRepository.save(existingUser);
        }
        
        return userRepository.save(user);
    }
}
