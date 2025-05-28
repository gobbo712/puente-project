import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NavigationBar from './components/NavigationBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import InstrumentDetail from './pages/InstrumentDetail';
import Favorites from './pages/Favorites';
import UserList from './pages/UserList';
import { checkAuthStatus } from './store/authSlice';

function App() {
  const { isAuthenticated, sessionExpired, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  // Check auth status on initial load and set up session expiry check
  useEffect(() => {
    dispatch(checkAuthStatus());
    
    // Check auth status every minute
    const interval = setInterval(() => {
      dispatch(checkAuthStatus());
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Redirect to login if session expired
  useEffect(() => {
    if (sessionExpired && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login');
    }
  }, [sessionExpired, navigate, location.pathname]);

  return (
    <div className="min-h-screen">
      {isAuthenticated && <NavigationBar />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/instrument/:symbol" element={isAuthenticated ? <InstrumentDetail /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={isAuthenticated ? <Favorites /> : <Navigate to="/login" />} />
          <Route path="/admin/users" element={isAuthenticated ? <UserList /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 