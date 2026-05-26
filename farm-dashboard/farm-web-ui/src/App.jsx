import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Login from './Login';

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  
  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;