package com.puente.tradingapp.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "instruments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Instrument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstrumentType type;

    private BigDecimal currentPrice;
    private BigDecimal dailyChange;
    private BigDecimal weeklyChange;
    private BigDecimal dailyHigh;
    private BigDecimal dailyLow;
    private Long volume;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    public enum InstrumentType {
        STOCK,
        CRYPTO,
        FOREX,
        INDEX
    }
}