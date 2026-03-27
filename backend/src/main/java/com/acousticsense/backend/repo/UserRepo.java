package com.acousticsense.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.acousticsense.backend.model.User;

public interface UserRepo extends JpaRepository<User,Long> {
Optional<User> findByEmail(String email);
}
