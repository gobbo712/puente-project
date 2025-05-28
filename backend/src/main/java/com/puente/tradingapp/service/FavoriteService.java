package com.puente.tradingapp.service;

import com.puente.tradingapp.model.Favorite;

import java.util.List;

public interface FavoriteService {
    List<Favorite> getUserFavorites(Long userId);

    Favorite addFavorite(Long userId, Long instrumentId);

    void removeFavorite(Long userId, Long instrumentId);

    boolean isFavorite(Long userId, Long instrumentId);
}