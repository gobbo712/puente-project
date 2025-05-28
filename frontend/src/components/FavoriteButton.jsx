import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites, fetchFavorites } from '../store/favoritesSlice';

const FavoriteButton = ({ instrumentId }) => {
  const dispatch = useDispatch();
  const { favorites, isLoading } = useSelector((state) => state.favorites);
  const { user } = useSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  
  // Check if this instrument is already in favorites
  useEffect(() => {
    console.log('FavoriteButton useEffect: checking favorites for', instrumentId);
    console.log('Current favorites:', favorites);
    
    if (favorites && favorites.length > 0) {
      // Find favorite by checking different possible data structures
      const favorite = favorites.find(fav => {
        const favId = fav.instrumentId || 
                     (fav.instrument && fav.instrument.id) || 
                     fav.instrument || 
                     fav.id;
        
        // Compare as strings to avoid type mismatches
        return String(favId) === String(instrumentId);
      });
      
      if (favorite) {
        console.log('Found favorite:', favorite);
        setIsFavorite(true);
        setFavoriteId(favorite.id);
      } else {
        console.log('No matching favorite found');
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } else {
      setIsFavorite(false);
      setFavoriteId(null);
    }
  }, [favorites, instrumentId]); // Dependencies ensure this runs when favorites change
  
  // Fetch favorites if not already loaded, or when user changes
  useEffect(() => {
    // Only fetch if we have a valid user
    if (user && user.id) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, user]); // Added user dependency to refetch when user changes
  
  const toggleFavorite = () => {
    if (isLoading) return;
    
    // Immediately update the UI state
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    
    // Then dispatch the async action
    if (newFavoriteState) {
      console.log('Adding to favorites:', instrumentId);
      dispatch(addToFavorites(instrumentId))
        .unwrap()
        .then(response => {
          console.log('Successfully added to favorites:', response);
        })
        .catch(error => {
          console.error('Failed to add to favorites:', error);
          // Revert UI state on error
          setIsFavorite(false);
        });
    } else {
      console.log('Removing from favorites:', instrumentId);
      dispatch(removeFromFavorites(instrumentId))
        .unwrap()
        .then(() => {
          console.log('Successfully removed from favorites');
        })
        .catch(error => {
          console.error('Failed to remove from favorites:', error);
          // Revert UI state on error
          setIsFavorite(true);
        });
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