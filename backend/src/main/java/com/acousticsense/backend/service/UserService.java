package com.acousticsense.backend.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.multipart.MultipartFile;

import com.acousticsense.backend.DTO.UpdateProfileRequest;
import com.acousticsense.backend.DTO.UserProfileResponse;
import com.acousticsense.backend.model.User;
import com.acousticsense.backend.repo.UserRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
@Service
@RequiredArgsConstructor
@Slf4j //Lombok annotation to handle console logs
public class UserService {

    private final UserRepo userRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;
    // Helper method to safely grab the logged-in user for all profile operations
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not found"));
    }

    public UserProfileResponse getMyProfile() {
        User user = getCurrentUser();
          
      
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture()) 
                .build();
    }

    
    public UserProfileResponse updateMyProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

  
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        userRepository.save(user);
        
       
        return getMyProfile(); 
    }

  
    public void deleteMyProfile() {
        User user = getCurrentUser();
        deleteOldProfilePicture(user.getProfilePicture());
        userRepository.delete(user);
    }
    public UserProfileResponse uploadProfilePicture(MultipartFile file) throws IOException{
        User user =getCurrentUser();

        //Creating folder if doesnt exist
        String uploadDir="uploads/avatars/";
        File directory = new File(uploadDir);
        
        if (!directory.exists()) {
            directory.mkdirs();
        }
        //generating a safe and unique file name 
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        
        //saving the file to hard drive
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
         
        //Updating userProfile picture for frontend to read it
        String fileUrl = baseUrl + "/" + uploadDir + fileName;
        deleteOldProfilePicture(user.getProfilePicture());
        user.setProfilePicture(fileUrl);
        userRepository.save(user);
        return getMyProfile();
    }
    private void deleteOldProfilePicture(String oldImageUrl) {
        if (oldImageUrl != null && oldImageUrl.contains("uploads/avatars/")) {
            try {
                // Extract just the "uploads/avatars/filename.jpg" part from the full URL
                String relativePath = oldImageUrl.substring(oldImageUrl.indexOf("uploads/avatars/"));
                Path filePath = Paths.get(relativePath);
                
                // Only deletes if it actually exists to prevent crashing
                Files.deleteIfExists(filePath); 
                log.info("Successfully deleted old orphaned file: " + relativePath);
            } catch (Exception e) {
                log.error("Failed to delete old profile picture: " + e.getMessage());
            }
        }
}
}