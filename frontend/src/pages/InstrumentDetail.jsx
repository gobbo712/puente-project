import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInstrumentBySymbol, resetCurrentInstrument } from '../store/marketSlice';
import { fetchFavorites } from '../store/favoritesSlice';
import FavoriteButton from '../components/FavoriteButton';

const InstrumentDetail = () => {
  const { symbol } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentInstrument, isLoading, error } = useSelector((state) => state.market);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Fetch instrument data
    dispatch(fetchInstrumentBySymbol(symbol));
    
    // Make sure favorites are fetched for the current user
    if (user && user.id) {
      dispatch(fetchFavorites());
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(resetCurrentInstrument());
    };
  }, [dispatch, symbol, user]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    const isPositive = value >= 0;
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </span>
    );
  };
  
  return (
    <div>
      <button 
        onClick={handleBack}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">Loading instrument data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : currentInstrument ? (
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">{currentInstrument.symbol}</h1>
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {currentInstrument.type}
                </span>
              </div>
              <p className="text-lg text-gray-600">{currentInstrument.name}</p>
            </div>
            
            <FavoriteButton instrumentId={currentInstrument.id} />
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-4xl font-bold">{formatPrice(currentInstrument.currentPrice)}</p>
              </div>
              
              <div className="text-right">
                <div>
                  <span className="text-sm text-gray-500">24h Change: </span>
                  <span className="text-lg font-medium">{formatPercentage(currentInstrument.dailyChange)}</span>
                </div>
                
                <div>
                  <span className="text-sm text-gray-500">7d Change: </span>
                  <span className="text-lg font-medium">
                    {formatPercentage(currentInstrument.weeklyChange || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Daily High</p>
              <p className="text-xl font-semibold">{formatPrice(currentInstrument.dailyHigh)}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Daily Low</p>
              <p className="text-xl font-semibold">{formatPrice(currentInstrument.dailyLow)}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat('en-US').format(currentInstrument.volume)}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-xl font-semibold">
                {new Date(currentInstrument.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No instrument data found for symbol: {symbol}</p>
        </div>
      )}
    </div>
  );
};

export default InstrumentDetail; 