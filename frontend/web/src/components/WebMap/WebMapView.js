import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import data from '../../../../shared/data';
import 'leaflet/dist/leaflet.css';
import Navbar from '../Navbar/Navbar';
import "./WebMapView.css";
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import TreeDetail from '../TreeDetail/TreeDetail';
import DynamicMarker from '../DynamicMarker/DynamicMarker';


const layers = [
    {
        name: 'Standaard',
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
        preview: 'https://tile.openstreetmap.org/12/2048/1360.png',
    },
    {
        name: 'Satelliet',
        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        preview: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/12/1360/2048',
    },
    {
        name: 'Fietsen',
        url: 'https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=effe903119e1476883987eec6dfc2a5b',
        attribution: '&copy; OpenCycleMap contributors',
        preview: 'https://tile.thunderforest.com/cycle/12/2048/1360.png?apikey=effe903119e1476883987eec6dfc2a5b',
    },
];
const LayerControl = ({ activeLayer, setActiveLayer }) => {
    const map = useMap();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const tileLayer = L.tileLayer(activeLayer.url, {
            attribution: activeLayer.attribution,
        });
        tileLayer.addTo(map);

        return () => {
            map.eachLayer((layer) => {
                if (layer.options.attribution === activeLayer.attribution) {
                    map.removeLayer(layer);
                }
            });
        };
    }, [activeLayer, map]);

    return (
        <div
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
            }}
        >
            {/* Main Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                    }}
                >
                    🗺️ Lagen
                </button>
            )}

            {/* Options */}
            {isOpen && (
                <div
                    style={{
                        backgroundColor: 'white',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                        marginTop: '10px',
                        textAlign: 'center',
                    }}
                >
                    {layers.map((layer, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'inline-block',
                                margin: '5px',
                                textAlign: 'center',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setActiveLayer(layer);
                                    setIsOpen(false);
                                }}
                                style={{
                                    backgroundImage: `url(${layer.preview})`,
                                    backgroundSize: 'cover',
                                    width: '60px',
                                    height: '60px',
                                    border: activeLayer.name === layer.name ? '3px solid #4CAF50' : '1px solid #ccc',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                                title={layer.name}
                            />
                            <span
                                style={{
                                    display: 'block',
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#333',
                                }}
                            >
                                {layer.name}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MapView = () => {
    const [trees, setTrees] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeLayer, setActiveLayer] = useState(layers[0]);
    const navigate = useNavigate();
    const [center] = useState([50.95306, 5.352692]);
    const [zoom] = useState(16);
    const [selectedTree, setSelectedTree] = useState(null);
    useEffect(() => {
        const fetchTrees = async () => {
          const fetchedTrees = await data.getTrees();
          setTrees(fetchedTrees);
        };
    
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
            console.error('Error verifying token:', error);
            setIsAuthenticated(false);
          }
        };
    
        verifyToken();
        fetchTrees();
      }, []);
    const handleTreeSelect = (tree) => {
        setSelectedTree(tree);
    };

    const handleCloseDetail = () => {
        setSelectedTree(null);
    };

    return (
        <div className="layout">
            <Navbar />
            <div className={`map-container ${selectedTree ? 'map-container-selected' : ''}`}>
                <div className="map-area">
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        className="leaflet-map"
                    >
                        <LayerControl activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
                        <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                        {trees.map((tree) => (
                            <DynamicMarker
                                key={tree.id}
                                tree={tree}
                                isSelected={selectedTree?.id === tree.id}
                                onTreeSelect={handleTreeSelect}
                            />
                        ))}
                    </MapContainer>
                </div>
                {selectedTree && <TreeDetail selectedTree={selectedTree} onClose={handleCloseDetail} />}
            </div>
        </div>
    );
};

export default MapView;
