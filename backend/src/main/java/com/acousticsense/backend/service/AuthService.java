package com.acousticsense.backend.service;

import com.acousticsense.backend.model.AuthResponse;
import com.acousticsense.backend.model.User;
import com.acousticsense.backend.repo.UserRepo;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepository;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        System.out.println("👉 Registering User: " + request.getEmail());
        
        // This is a great UI feature!
        String defaultAvatar = "https://ui-avatars.com/api/?name="
                + request.getFirstName() + "+" + request.getLastName()
                + "&background=10b981&color=fff&rounded=true&bold=true";
                
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setProfilePicture(defaultAvatar); // We need to add this to the User model!
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .email(savedUser.getEmail())
                .profilePicture(savedUser.getProfilePicture())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        System.out.println("👉 Login Attempt for: [" + request.getEmail() + "]");
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found in DB"));

            var jwtToken = jwtService.generateToken(user);
            System.out.println("✅ Login Successful. Token Generated.");

            return AuthResponse.builder()
                    .token(jwtToken)
                    .id(user.getId())
                    .firstName(user.getFirstName())
                    .email(user.getEmail())
                    .profilePicture(user.getProfilePicture())
                    .build();

        } catch (Exception e) {
            System.out.println("❌ Login Failed: " + e.getMessage());
            throw new BadCredentialsException("Invalid Email or Password");
        }
    }
}