package com.puente.tradingapp.service;

import java.util.List;

import com.puente.tradingapp.model.Favorite;

public interface FavoriteService {
    List<Favorite> getUserFavorites(Long userId);

    Favorite addFavorite(Long userId, Long instrumentId);

    void removeFavorite(Long userId, Long instrumentId);

    boolean isFavorite(Long userId, Long instrumentId);
}