import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';

const InstrumentCard = ({ instrument }) => {
  const { symbol, name, currentPrice, dailyChange, type } = instrument;
  
  // Format price with 2 decimal places
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(currentPrice);
  
  // Determine if price change is positive or negative
  const isPositive = dailyChange >= 0;
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            <Link to={`/instrument/${symbol}`} className="hover:text-blue-600">
              {symbol}
            </Link>
          </h3>
          <p className="text-sm text-gray-500">{name}</p>
        </div>
        <div className="flex items-center">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 mr-2">
            {type}
          </span>
          <FavoriteButton instrumentId={instrument.id} />
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-end">
        <div>
          <p className="text-2xl font-bold">{formattedPrice}</p>
        </div>
        <div>
          <p 
            className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}{dailyChange.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstrumentCard; 