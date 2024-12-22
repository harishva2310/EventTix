package com.ticketbooking.User.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.User.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
User findByEmail(String email);
}
