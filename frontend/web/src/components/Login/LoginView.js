import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./LoginView.css";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);  
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Controleer of beide velden zijn ingevuld
    if (!username || !password) {
      setError('Vul zowel gebruikersnaam als wachtwoord in.');
      return;
    }

    const formDetails = new URLSearchParams();
    formDetails.append('username', username);
    formDetails.append('password', password);

    try {
      const baseUrl = process.env.REACT_APP_EXTERNAL_IP || 'localhost';
      const response = await fetch(`http://${baseUrl}:8000/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDetails,
      });

      if (response.ok) {
        const data = await response.json();

        sessionStorage.setItem('token', data.data.access_token);
        navigate('/map');
      } else if (response.status === 401) {
        setError('Ongeldige gebruikersnaam of wachtwoord.');
      } else {
        setError('Er is iets misgegaan. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Er is een probleem met de server. Probeer het later opnieuw.');
    }
  };

  const handleGuest = () => {
    navigate('/map');
  };

  return (
    <div className="body-container">
      <div className="login-container">
        <img src='logopxlboom.png' alt="logo" />
        <h2>Login</h2>
        <label htmlFor='username'>Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor='password'>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="error-message">{error}</div>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <button className="guest-button" onClick={handleGuest}>
          Ga verder als gast
        </button>
      </div>
    </div>
  );
};

export default Login;
