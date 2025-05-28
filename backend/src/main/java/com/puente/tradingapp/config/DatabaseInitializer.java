package com.puente.tradingapp.config;

import com.puente.tradingapp.model.Role;
import com.puente.tradingapp.model.Role.ERole;
import com.puente.tradingapp.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        initRoles();
    }

    private void initRoles() {
        // Create roles if they don't exist
        Arrays.stream(ERole.values()).forEach(role -> {
            if (!roleRepository.findByName(role).isPresent()) {
                Role newRole = new Role();
                newRole.setName(role);
                roleRepository.save(newRole);
            }
        });
    }
}