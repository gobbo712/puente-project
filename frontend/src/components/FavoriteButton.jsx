import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../store/favoritesSlice';

const FavoriteButton = ({ instrumentId }) => {
  const dispatch = useDispatch();
  const { favorites, isLoading } = useSelector((state) => state.favorites);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if this instrument is already in favorites
  useEffect(() => {
    if (favorites.length > 0) {
      const found = favorites.some(fav => fav.instrumentId === instrumentId);
      setIsFavorite(found);
    }
  }, [favorites, instrumentId]);
  
  // Fetch favorites if not already loaded
  useEffect(() => {
    if (favorites.length === 0) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favorites.length]);
  
  const toggleFavorite = () => {
    if (isLoading) return;
    
    if (isFavorite) {
      // Find the favorite object to get its ID
      const favorite = favorites.find(fav => fav.instrumentId === instrumentId);
      if (favorite) {
        dispatch(removeFromFavorites(favorite.id));
      }
    } else {
      dispatch(addToFavorites(instrumentId));
    }
  };
  
  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`w-8 h-8 flex items-center justify-center rounded-full ${
        isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
      } transition-colors`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {/* Star icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
};

export default FavoriteButton; 