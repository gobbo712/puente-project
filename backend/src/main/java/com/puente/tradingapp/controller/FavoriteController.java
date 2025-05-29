package com.puente.tradingapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.puente.tradingapp.model.Favorite;
import com.puente.tradingapp.payload.request.FavoriteRequest;
import com.puente.tradingapp.payload.response.InstrumentResponse;
import com.puente.tradingapp.payload.response.MessageResponse;
import com.puente.tradingapp.security.service.UserDetailsImpl;
import com.puente.tradingapp.service.FavoriteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/favorites")
@Tag(name = "Favorites", description = "User favorites API")
@SecurityRequirement(name = "Bearer Authentication")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Get user favorites", description = "Returns a list of all instruments favorited by the current user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<InstrumentResponse>> getUserFavorites(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Favorite> favorites = favoriteService.getUserFavorites(userDetails.getId());

        List<InstrumentResponse> response = favorites.stream()
                .map(favorite -> InstrumentResponse.fromInstrument(favorite.getInstrument(), true))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Add favorite", description = "Add an instrument to user's favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<InstrumentResponse> addFavorite(
            @Valid @RequestBody FavoriteRequest favoriteRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Favorite favorite = favoriteService.addFavorite(userDetails.getId(), favoriteRequest.getInstrumentId());

        return ResponseEntity.ok(InstrumentResponse.fromInstrument(favorite.getInstrument(), true));
    }

    @DeleteMapping("/{instrumentId}")
    @Operation(summary = "Remove favorite", description = "Remove an instrument from user's favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> removeFavorite(
            @PathVariable Long instrumentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        favoriteService.removeFavorite(userDetails.getId(), instrumentId);

        return ResponseEntity.ok(new MessageResponse("Favorite removed successfully"));
    }
}