package com.puente.tradingapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.puente.tradingapp.model.Favorite;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findAllByUserId(Long userId);

    Optional<Favorite> findByUserIdAndInstrumentId(Long userId, Long instrumentId);

    boolean existsByUserIdAndInstrumentId(Long userId, Long instrumentId);

    void deleteByUserIdAndInstrumentId(Long userId, Long instrumentId);
}