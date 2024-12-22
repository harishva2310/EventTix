package com.ticketbooking.User.controller;

import java.security.interfaces.RSAPublicKey;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.ticketbooking.User.dao.UserRepository;
import com.ticketbooking.User.entity.User;
import com.ticketbooking.User.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Value("${auth0.domainUrl}")
    private String domainUrl;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/id")
    public ResponseEntity<User> getUserById(@RequestParam("userId") Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/email")
    public ResponseEntity<User> getUserByEmail(@RequestParam("email") String email,
            @RequestHeader("Authorization") String token) throws JWTVerificationException, Exception {
        try {
            // Get Auth0 public key from JWKS endpoint
            JwkProvider provider = new UrlJwkProvider(domainUrl);
            
            //System.out.println("Received token: " + token);
            DecodedJWT jwt = JWT.decode(token.replace("Bearer ", ""));

            //System.out.println("Decoded JWT: " + jwt.getToken());
            Jwk jwk = provider.get(jwt.getKeyId());
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            // Verify token
            JWT.require(algorithm)
                    .withIssuer(jwt.getIssuer())
                    .build()
                    .verify(token.replace("Bearer ", ""));
            System.out.println("Token verification successful");

            User user = userRepository.findByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (JWTVerificationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/upsert")
    public ResponseEntity<User> upsertUser(@RequestBody User user) {
        User updatedUser = userService.upsertUser(user);
        return ResponseEntity.ok(updatedUser);
    }

}
