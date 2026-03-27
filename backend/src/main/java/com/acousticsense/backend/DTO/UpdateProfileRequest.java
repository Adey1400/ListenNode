package com.acousticsense.backend.DTO;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String profilePicture;
}