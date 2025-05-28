package com.puente.tradingapp.controller;

import com.puente.tradingapp.model.Role;
import com.puente.tradingapp.model.Role.ERole;
import com.puente.tradingapp.model.User;
import com.puente.tradingapp.payload.response.MessageResponse;
import com.puente.tradingapp.payload.response.UserResponse;
import com.puente.tradingapp.repository.RoleRepository;
import com.puente.tradingapp.repository.UserRepository;
import com.puente.tradingapp.security.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management API")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get the current authenticated user's profile")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(UserResponse.builder()
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .firstName(userDetails.getFirstName())
                .lastName(userDetails.getLastName())
                .roles(userDetails.getAuthorities().stream()
                        .map(item -> item.getAuthority())
                        .collect(Collectors.toList()))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Get a user by their ID (admin only)")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    UserResponse response = UserResponse.builder()
                            .id(user.getId())
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .firstName(user.getFirstName())
                            .lastName(user.getLastName())
                            .roles(user.getRoles().stream()
                                    .map(role -> role.getName().name())
                                    .collect(Collectors.toList()))
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Get a list of all registered users (admin only)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .roles(user.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/{id}/toggle-admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle admin role", description = "Add or remove admin role from a user (admin only)")
    public ResponseEntity<?> toggleAdminRole(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    // Find admin role
                    Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Admin Role not found"));
                    
                    // Check if user already has admin role
                    boolean isAdmin = user.getRoles().stream()
                            .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
                    
                    // Toggle admin role
                    Set<Role> roles = new HashSet<>(user.getRoles());
                    if (isAdmin) {
                        // Make sure we don't remove the user role
                        if (roles.size() > 1) {
                            roles.remove(adminRole);
                            user.setRoles(roles);
                            userRepository.save(user);
                            return ResponseEntity.ok(new MessageResponse("Admin role removed from user"));
                        } else {
                            return ResponseEntity.badRequest()
                                    .body(new MessageResponse("User must have at least one role"));
                        }
                    } else {
                        // Add admin role
                        roles.add(adminRole);
                        user.setRoles(roles);
                        userRepository.save(user);
                        return ResponseEntity.ok(new MessageResponse("Admin role added to user"));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}