package com.puente.tradingapp.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FavoriteRequest {
    @NotNull
    private Long instrumentId;
}