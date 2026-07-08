import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ user: false, pass: false, auth: false });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Animation Phase: 0 = Approach, 1 = Peck, 2 = Ripple, 3 = Show Login Form
  const [phase, setPhase] = useState(0);

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'admin123';

  useEffect(() => {
    // Step 1: Wait for the approach animation to finish
    const approachTimer = setTimeout(() => {
      setPhase(1); // Trigger the peck

      // Step 2: Trigger ripple exactly at the peak of the peck (200ms in)
      const rippleTimer = setTimeout(() => {
        setPhase(2);

        // Step 3: Fade in the login dashboard right behind the shockwave
        const revealTimer = setTimeout(() => {
          setPhase(3);
        }, 300);

        return () => clearTimeout(revealTimer);
      }, 200);

      return () => clearTimeout(rippleTimer);
    }, 2000);

    return () => clearTimeout(approachTimer);
  }, []);

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
        onLoginSuccess(); 
      } else {
        setErrors({ user: false, pass: false, auth: true });
        setPassword('');
        setIsLoggingIn(false);
      }
    }, 800);
  };

  return (
    <div className="login-container">
      
      {/* 1. The Ripple Effect */}
      <div className={`screen-ripple ${phase >= 2 ? 'ripple-active' : 'ripple-hidden'}`}></div>
      
      {/* 2. The Chicken Asset */}
      <img 
        src="/chicken-asset.png" /* Replace with your extracted PNG */
        alt="AgroSec Mascot"
        className={`hero-chicken ${phase === 0 ? 'chicken-approach' : 'chicken-peck'}`}
        style={{ opacity: phase === 3 ? 0 : 1, transition: 'opacity 0.4s ease-out' }}
      />

      {/* 3. The Wrapped Login Content */}
      <div className={`login-content ${phase === 3 ? 'panel-visible' : 'panel-hidden'}`}>
        <div className="card">
          <div className="logo">Agro<span>Sec</span></div>
          <div className="tagline">Farmer's Portal</div>

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
    </div>
  );
};

export default Login;