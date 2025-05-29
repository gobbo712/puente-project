import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './store';
import './index.css';

// Access environment variables
const appName = import.meta.env.VITE_APP_NAME || 'Puente Trading App';
const debugMode = import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true';

// Configure debug tools if in debug mode
if (debugMode) {
  console.log(`${appName} starting in debug mode...`);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
); 