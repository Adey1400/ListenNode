package com.acousticsense.backend.service;


import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
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
public class UserService {

    private final UserRepo userRepository;

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
        userRepository.delete(user);
    }
    public UserProfileResponse uploadProfilePicture(MultipartFile file) throws IOException{
        User user =getCurrentUser();

        //Creating folder if doesnt exist
        String uploadDir="uploads/avatars/";
        File directory = new File(uploadDir);

        //generating a safe and unique file name 
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        
        //saving the file to hard drive
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
         
        //Updating userProfile picture for frontend to read it
        String fileUrl = "https://localhost:8080/uploads/avatars"+fileName;
        user.setProfilePicture(fileUrl);
        userRepository.save(user);
        return getMyProfile();
    }
}