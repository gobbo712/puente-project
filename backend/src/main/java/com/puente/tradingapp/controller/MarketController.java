package com.puente.tradingapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.puente.tradingapp.model.Instrument;
import com.puente.tradingapp.payload.response.InstrumentResponse;
import com.puente.tradingapp.security.service.UserDetailsImpl;
import com.puente.tradingapp.service.FavoriteService;
import com.puente.tradingapp.service.MarketDataService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/market")
@Tag(name = "Market Data", description = "Market data API")
@SecurityRequirement(name = "Bearer Authentication")
public class MarketController {

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping("/instruments")
    @Operation(summary = "Get all instruments", description = "Returns a list of all available instruments with their current prices and changes")
    public ResponseEntity<List<InstrumentResponse>> getAllInstruments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Instrument> instruments = marketDataService.getAllInstruments();

        List<InstrumentResponse> response = instruments.stream()
                .map(instrument -> {
                    boolean isFavorite = false;
                    if (userDetails != null) {
                        isFavorite = favoriteService.isFavorite(userDetails.getId(), instrument.getId());
                    }
                    return InstrumentResponse.fromInstrument(instrument, isFavorite);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/instruments/{symbol}")
    @Operation(summary = "Get instrument by symbol", description = "Returns detailed information about a specific instrument")
    public ResponseEntity<InstrumentResponse> getInstrumentBySymbol(
            @Parameter(description = "Instrument symbol", required = true) @PathVariable String symbol,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Instrument instrument = marketDataService.getInstrumentBySymbol(symbol)
                .orElseThrow(() -> new RuntimeException("Instrument not found with symbol: " + symbol));

        boolean isFavorite = false;
        if (userDetails != null) {
            isFavorite = favoriteService.isFavorite(userDetails.getId(), instrument.getId());
        }

        return ResponseEntity.ok(InstrumentResponse.fromInstrument(instrument, isFavorite));
    }
}