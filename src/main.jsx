import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/themes.css';
import './styles/components.css';
import './styles/monograph.css';
import './styles/search.css';
import './styles/drugs.css';
import './styles/saved.css';
import './styles/interactions.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
