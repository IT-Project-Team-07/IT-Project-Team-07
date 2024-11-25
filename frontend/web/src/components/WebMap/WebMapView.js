import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import sharedData from '../../../../shared/data';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import treeLogo from '../../../../shared/images/tree-icon.png'
import Navbar from '../Navbar/Navbar';

function getIconSize(zoom) {
    if (zoom >= 16) return [40, 40];
    if (zoom === 15 || zoom === 14) return [30, 30];
    if (zoom === 13) return [20, 20];
    return [0, 0]; // Icoon is onzichtbaar voor zoom 12 en lager
}

function DynamicMarker({ tree }) {
    const map = useMap();
    const [iconSize, setIconSize] = useState(getIconSize(map.getZoom()));

    const treeIcon = L.icon({
        iconUrl: treeLogo,
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [0, -iconSize[1]]
    });

    useMapEvents({
        zoomend: () => {
            setIconSize(getIconSize(map.getZoom()));
        }
    });

    if (iconSize[0] === 0) return null; // Verberg de marker volledig

    return (
        <Marker
            position={[tree.latitude, tree.longitude]}
            icon={treeIcon}
            eventHandlers={{
                click: () => {
                    map.flyTo([tree.latitude, tree.longitude], 16, {
                        duration: 0.5
                    });
                }
            }}
        >
            <Popup>
                <strong>{tree.title}</strong><br />{tree.description}<br/>{tree.longitude} <br/> {tree.latitude}
            </Popup>
        </Marker>
    );
}

const MapView = () => {
    const [center] = useState([50.95306, 5.352692]);
    const [zoom] = useState(16);

    return (
        <div style={{ height: '100vh', width: '100%', backgroundColor: "#f0eee4" }}>
            <Navbar style={{}} />
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: "85vh", margin: "10px", border: "4px solid #b2adad", borderRadius: "20px", zIndex: "0" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />
                {sharedData.map(tree => (
                    <DynamicMarker key={tree.id} tree={tree} />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;