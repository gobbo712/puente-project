import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../store/favoritesSlice';
import { fetchInstruments } from '../store/marketSlice';
import InstrumentCard from '../components/InstrumentCard';

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, isLoading: favoritesLoading, error: favoritesError } = useSelector((state) => state.favorites);
  const { instruments, isLoading: instrumentsLoading } = useSelector((state) => state.market);
  
  useEffect(() => {
    dispatch(fetchFavorites());
    
    // Also fetch all instruments if not already loaded
    if (instruments.length === 0) {
      dispatch(fetchInstruments());
    }
  }, [dispatch, instruments.length]);
  
  // Debug logs
  console.log('Favorites data:', favorites);
  console.log('Instruments data:', instruments);
  
  // Get favorite instruments by matching IDs
  const favoriteInstruments = instruments.filter(instrument => {
    if (!favorites || favorites.length === 0) return false;
    
    return favorites.some(favorite => {
      // Handle different potential data structures
      const favoriteId = favorite.instrumentId || favorite.instrument?.id || favorite.instrument || favorite.id;
      console.log(`Comparing favorite ID: ${favoriteId} with instrument.id: ${instrument.id}`);
      
      // Try different types of comparison (string/number)
      return favoriteId == instrument.id || 
             String(favoriteId) === String(instrument.id);
    });
  });
  
  console.log('Filtered favorite instruments:', favoriteInstruments);
  
  const isLoading = favoritesLoading || instrumentsLoading;
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading favorites...</p>
        </div>
      ) : favoritesError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {favoritesError}
        </div>
      ) : favoriteInstruments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteInstruments.map((instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">You don&apos;t have any favorites yet.</p>
          <p className="mt-2 text-gray-500">
            Add instruments to your favorites by clicking the star icon.
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites; 