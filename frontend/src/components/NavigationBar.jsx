import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

const NavigationBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

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
            {isAdmin && (
              <Link to="/admin/users" className="hover:text-blue-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Users
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <span className="hidden md:inline">
              Welcome, {user.username || user.email}
              {isAdmin && (
                <span className="ml-2 bg-red-500 text-xs font-semibold px-2 py-1 rounded-full">
                  ADMIN
                </span>
              )}
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
          {isAdmin && (
            <Link to="/admin/users" className="hover:text-blue-200 py-1">
              Users
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 