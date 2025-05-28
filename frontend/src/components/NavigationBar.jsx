import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const NavigationBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">
            Puente Trading
          </Link>
          <div className="ml-8 hidden md:flex space-x-4">
            <Link to="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link to="/favorites" className="hover:text-blue-200">
              Favorites
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <span className="hidden md:inline">
              Welcome, {user.username || user.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden border-t border-blue-500">
        <div className="container mx-auto px-4 py-2 flex justify-center space-x-8">
          <Link to="/" className="hover:text-blue-200 py-1">
            Home
          </Link>
          <Link to="/favorites" className="hover:text-blue-200 py-1">
            Favorites
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 