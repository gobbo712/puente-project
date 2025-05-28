package com.puente.tradingapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerRedirectController {

    @GetMapping("/swagger")
    public String redirectToSwaggerUI() {
        return "forward:/swagger-ui/index.html";
    }

    @GetMapping("/")
    public String redirectRootToSwaggerUI() {
        return "redirect:/swagger-ui/index.html";
    }
}