import React, { useState, useEffect } from 'react';
import "./Navbar.css"
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      try {
        const baseUrl = process.env.REACT_APP_EXTERNAL_IP || 'localhost';
        const response = await fetch(`http://${baseUrl}:8000/verify-token/${token}`, {
          method: 'GET',
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Er is een fout opgetreden bij het verifiëren va  n de token:", error);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);


  const handleLogoutClick = async () => {
    console.log("Logging out...");
    try {
      const token = sessionStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_EXTERNAL_IP || 'localhost';
      await fetch(`http://${baseUrl}:8000/revoke-token/${token}`, {
        method: 'POST',
      });
      sessionStorage.removeItem('token');
      console.log("Token revoked successfully.");
    } catch (error) {
      console.error("Er is een fout opgetreden bij het revoken van de token:", error);
    }

    setIsAuthenticated(false);

    navigate("/");
  };


  return (
    <nav style={{
      height: "10vh",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src='logopxlboom.png' alt="logo" style={{ height: '12vh', marginRight: '20px' }}></img>
        <button onClick={() => navigate('/map')} className="nav-text-button">MAP</button>
        {isAuthenticated &&
          <button onClick={() => navigate('/upload')} className="nav-text-button">UPLOAD</button>
        }
      </div>
      {isAuthenticated &&
        <button onClick={() => handleLogoutClick()} className="nav-action-button">LOGOUT</button>
      }
      {!isAuthenticated &&
        <button onClick={() => navigate('/')} className="nav-action-button">LOGIN</button>
      }
    </nav>
  );
};

export default Navbar;