package com.puente.tradingapp.payload.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.puente.tradingapp.model.Instrument;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InstrumentResponse {
    private Long id;
    private String symbol;
    private String name;
    private String type;
    private BigDecimal currentPrice;
    private BigDecimal dailyChange;
    private BigDecimal weeklyChange;
    private BigDecimal dailyHigh;
    private BigDecimal dailyLow;
    private Long volume;
    private LocalDateTime lastUpdated;
    private Boolean isFavorite;

    public static InstrumentResponse fromInstrument(Instrument instrument, Boolean isFavorite) {
        return InstrumentResponse.builder()
                .id(instrument.getId())
                .symbol(instrument.getSymbol())
                .name(instrument.getName())
                .type(instrument.getType().name())
                .currentPrice(instrument.getCurrentPrice())
                .dailyChange(instrument.getDailyChange())
                .weeklyChange(instrument.getWeeklyChange())
                .dailyHigh(instrument.getDailyHigh())
                .dailyLow(instrument.getDailyLow())
                .volume(instrument.getVolume())
                .lastUpdated(instrument.getLastUpdated())
                .isFavorite(isFavorite)
                .build();
    }
}