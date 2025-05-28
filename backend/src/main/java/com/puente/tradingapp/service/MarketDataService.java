package com.puente.tradingapp.service;

import com.puente.tradingapp.model.Instrument;

import java.util.List;
import java.util.Optional;

public interface MarketDataService {
    List<Instrument> getAllInstruments();

    Optional<Instrument> getInstrumentBySymbol(String symbol);

    void refreshMarketData();
}