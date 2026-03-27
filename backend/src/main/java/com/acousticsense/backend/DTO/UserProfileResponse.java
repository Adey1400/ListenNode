package com.acousticsense.backend.DTO;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePicture;
}