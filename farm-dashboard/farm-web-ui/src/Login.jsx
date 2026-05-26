import React, { useState } from 'react';
import './Login.css'; // We will create this next

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ user: false, pass: false, auth: false });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'admin123';

  const handleLogin = () => {
    let valid = true;
    const newErrors = { user: false, pass: false, auth: false };

    if (!username.trim()) {
      newErrors.user = true;
      valid = false;
    }
    if (!password) {
      newErrors.pass = true;
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    setIsLoggingIn(true);

    setTimeout(() => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        onLoginSuccess(); // This unlocks the dashboard!
      } else {
        setErrors({ user: false, pass: false, auth: true });
        setPassword('');
        setIsLoggingIn(false);
      }
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="logo">Agro<span>sec</span></div>
        <div className="tagline">Admin Portal</div>

        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={errors.user ? 'err' : ''}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {errors.user && <div className="error-msg show">Username is required.</div>}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.pass || errors.auth ? 'err' : ''}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        {errors.pass && <div className="error-msg show">Password is required.</div>}
        {errors.auth && <div className="error-msg show">Incorrect username or password.</div>}

        <button disabled={isLoggingIn} onClick={handleLogin}>
          {isLoggingIn ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
      <div className="footer">© Agrosec 2026</div>
    </div>
  );
};

export default Login;