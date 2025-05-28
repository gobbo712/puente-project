import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInstruments } from '../store/marketSlice';
import { fetchFavorites } from '../store/favoritesSlice';
import InstrumentCard from '../components/InstrumentCard';

const Home = () => {
  const dispatch = useDispatch();
  const { instruments, isLoading, error } = useSelector((state) => state.market);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('ALL');
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchInstruments());
      
      // Fetch favorites for the current user
      if (user && user.id) {
        dispatch(fetchFavorites());
      }
    }
  }, [dispatch, isAuthenticated, user]);
  
  // Filter instruments based on type
  const filteredInstruments = filter === 'ALL' 
    ? instruments 
    : instruments.filter(instrument => instrument.type === filter);
  
  // Authentication message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        <p className="font-bold">Authentication Required</p>
        <p>Please <Link to="/login" className="text-blue-600 underline">login</Link> or <Link to="/register" className="text-blue-600 underline">register</Link> to view market data.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Overview</h1>
        
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-md ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${filter === 'STOCK' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('STOCK')}
          >
            Stocks
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${filter === 'CRYPTO' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setFilter('CRYPTO')}
          >
            Crypto
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Loading instruments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading market data:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstruments.map((instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
          
          {filteredInstruments.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No instruments found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home; 