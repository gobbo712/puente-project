import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleAdminRole, resetToggleStatus } from '../store/userSlice';
import { Navigate } from 'react-router-dom';

const UserList = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error, toggleLoading, toggleSuccess, toggleMessage } = useSelector((state) => state.users);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  
  // Fetch users on component mount if user is admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, isAuthenticated, isAdmin]);
  
  // Reset toggle status after 3 seconds
  useEffect(() => {
    if (toggleSuccess) {
      setActionInProgress(false);
      const timer = setTimeout(() => {
        dispatch(resetToggleStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toggleSuccess, dispatch]);
  
  const handleToggleAdmin = (userId) => {
    setActionInProgress(true);
    dispatch(toggleAdminRole(userId));
  };
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If not admin, redirect to home
  if (!isAdmin) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Access Denied</p>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {toggleSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{toggleMessage}</p>
        </div>
      )}
      
      {users && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                // Check if user has admin role
                const isUserAdmin = user.roles?.some(role => role.includes('ADMIN'));
                // Prevent toggling your own admin status
                const isSelf = user.id === parseInt(localStorage.getItem('userId'));
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.roles?.map((role) => (
                        <span 
                          key={role} 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role.includes('ADMIN') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          } mr-2`}
                        >
                          {role.replace('ROLE_', '')}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleToggleAdmin(user.id)}
                        disabled={actionInProgress || toggleLoading || isSelf}
                        className={`px-3 py-1 rounded text-sm ${
                          isUserAdmin 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        } ${(actionInProgress || toggleLoading || isSelf) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isSelf ? "You cannot change your own admin status" : ""}
                      >
                        {isUserAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  );
};

export default UserList; 