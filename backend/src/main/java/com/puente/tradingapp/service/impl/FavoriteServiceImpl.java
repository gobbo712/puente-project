package com.puente.tradingapp.service.impl;

import com.puente.tradingapp.model.Favorite;
import com.puente.tradingapp.model.Instrument;
import com.puente.tradingapp.model.User;
import com.puente.tradingapp.repository.FavoriteRepository;
import com.puente.tradingapp.repository.InstrumentRepository;
import com.puente.tradingapp.repository.UserRepository;
import com.puente.tradingapp.service.FavoriteService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InstrumentRepository instrumentRepository;

    @Override
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findAllByUserId(userId);
    }

    @Override
    @Transactional
    public Favorite addFavorite(Long userId, Long instrumentId) {
        if (favoriteRepository.existsByUserIdAndInstrumentId(userId, instrumentId)) {
            return favoriteRepository.findByUserIdAndInstrumentId(userId, instrumentId)
                    .orElseThrow(() -> new RuntimeException("Favorite exists but could not be retrieved"));
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Instrument instrument = instrumentRepository.findById(instrumentId)
                .orElseThrow(() -> new EntityNotFoundException("Instrument not found with id: " + instrumentId));

        Favorite favorite = Favorite.builder()
                .user(user)
                .instrument(instrument)
                .createdAt(LocalDateTime.now())
                .build();

        return favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long instrumentId) {
        if (!favoriteRepository.existsByUserIdAndInstrumentId(userId, instrumentId)) {
            throw new EntityNotFoundException(
                    "Favorite not found for user id: " + userId + " and instrument id: " + instrumentId);
        }
        favoriteRepository.deleteByUserIdAndInstrumentId(userId, instrumentId);
    }

    @Override
    public boolean isFavorite(Long userId, Long instrumentId) {
        return favoriteRepository.existsByUserIdAndInstrumentId(userId, instrumentId);
    }
}