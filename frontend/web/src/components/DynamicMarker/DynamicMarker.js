import React, { useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import treeLogo from '../../../../shared/images/tree-icon.png';
import selectedTreeLogo from '../../../../shared/images/tree-icon-selected.png';

function getIconSize(zoom) {
    if (zoom >= 16) return [40, 40];
    if (zoom === 15 || zoom === 14) return [30, 30];
    if (zoom === 13) return [20, 20];
    return [0, 0];
}

const DynamicMarker = ({ tree, isSelected, onTreeSelect }) => {
    const map = useMap();
    const [iconSize, setIconSize] = useState(getIconSize(map.getZoom()));

    const treeIcon = L.icon({
        iconUrl: isSelected ? selectedTreeLogo : treeLogo,
        iconSize: iconSize,
        iconAnchor: [iconSize[0] / 2, iconSize[1]],
        popupAnchor: [0, -iconSize[1]],
    });

    useMapEvents({
        zoomend: () => {
            setIconSize(getIconSize(map.getZoom()));
        },
    });

    if (iconSize[0] === 0) return null;

    return (
        <Marker
            position={[tree.latitude, tree.longitude]}
            icon={treeIcon}
            eventHandlers={{
                click: () => {
                    map.flyTo([tree.latitude, tree.longitude], 16, { duration: 0.5 });
                    onTreeSelect(tree); 
                },
            }}
        >
        </Marker>
    );
};

export default DynamicMarker;
