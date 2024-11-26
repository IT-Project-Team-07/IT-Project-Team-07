import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import data from '../../../shared/data';
import Navbar from './Navbar/Navbar';

function UploadView() {
  const [fileContent, setFileContent] = useState(null);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/");
      }

      try {
        const baseUrl = process.env.REACT_APP_EXTERNAL_IP || 'localhost';
        const response = await fetch(`http://${baseUrl}:8000/verify-token/${token}`, {
          method: "GET",
        });

        if (response.ok) {
          return;
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Er is een fout opgetreden bij het verifiëren van de token: ", error)
        navigate("/");
      }
    };

    verifyToken();
  }, [navigate]);

  const validateArray = (array) => {

  }

  const handleFile = (file) => {
    setErrors([]);
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const response = JSON.parse(event.target.result);
          if (Array.isArray(response)) {
            let newErrors = [];
            const validTrees = response.filter((tree, index) => {
              const treeErrors = [];
              
              if (!tree.name) {
                treeErrors.push(`Boom met index ${index}: Naam ontbreekt.`);
              }
              if (
                !tree.position ||
                !Array.isArray(tree.position) ||
                tree.position.length !== 2 ||
                typeof tree.position[0] !== 'number' ||
                typeof tree.position[1] !== 'number'
              ) {
                treeErrors.push(`Boom met index ${index}: De positie ontbreekt of is ongeldig.`);
              }
              if (!tree.description) {
                treeErrors.push(`Boom met index ${index}: De beschrijving ontbreekt.`);
              }
              
              if (treeErrors.length > 0) {
                  newErrors.push(...treeErrors);
                return false;
              }
              return true;
            });
  
            setErrors(newErrors);
  
            if (validTrees.length > 0) {
              validTrees.forEach(tree => {
                const [latitude, longitude] = tree.position;
                data.addTree({
                  name: tree.name,
                  description: tree.description || 'Geen beschrijving opgegeven',
                  latitude,
                  longitude,
                });
              });
              navigate('/map');
            }
            else if(newErrors.length === 0) {
              setErrors(['Het JSON-bestand bevat geen geldige bomen.']);
            }
          }
        } catch (err) {
          setErrors(['Er is een fout opgetreden bij het lezen van het JSON-bestand.']);
          setFileContent(null);
        }
      };
      reader.readAsText(file);
    } else {
      setErrors(['Selecteer een geldig JSON-bestand.']);
      setFileContent(null);
    }
  };
  
  




  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={{
      backgroundColor: "#f0eee4", 
      height: "100vh",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          style={{
            border: '10px dashed #cccccc',
            padding: '50px',
            textAlign: 'center',
            borderRadius: '8px',
            color: '#777',
            width: "50%",
            height: "50%",
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <p>Sleep je JSON-bestand hierheen of</p>
          <label style={{ cursor: 'pointer', color: '#007bff' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            klik om een bestand te selecteren
          </label>

          {errors.length > 0 && (
          <ul style={{ color: 'red', textAlign: 'left', overflowX: 'auto'}}>
          {errors.map((error, index) => (
          <li key={index}>{error}</li>
          ))}
          </ul>
          )}


          {fileContent && (
            <pre style={{
              background: '#f8f8f8',
              padding: '20px',
              borderRadius: '5px',
              textAlign: 'left',
              marginTop: '20px',
              maxWidth: '100%',
              overflowX: 'auto'
            }}>
              {JSON.stringify(fileContent, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );

}

export default UploadView;
