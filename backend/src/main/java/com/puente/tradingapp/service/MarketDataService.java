package com.puente.tradingapp.service;

import java.util.List;
import java.util.Optional;

import com.puente.tradingapp.model.Instrument;

public interface MarketDataService {
    List<Instrument> getAllInstruments();

    Optional<Instrument> getInstrumentBySymbol(String symbol);

    void refreshMarketData();
}