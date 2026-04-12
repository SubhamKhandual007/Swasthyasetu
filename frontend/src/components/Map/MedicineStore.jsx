// MedicineStore.jsx
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import 'leaflet.markercluster/dist/MarkerCluster.css'; // Import MarkerCluster CSS
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'; // Import default cluster styles
import styles from './MedicineStore.module.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';

// Import the JSON data for medicine stores and pathology labs
import medicineStoresData from '../assets/Data/medicine_store_list.json';
import pathoLabStoresData from '../assets/Data/PathoLab_store_list.json';

// Import the custom icons
import medicineIconPng from '../assets/MedicineStore_pin.png'; // Medicine store icon
import pathoLabIconPng from '../assets/PathoLab_pin.png'; // Pathology lab icon

// Fix for default marker icons and add custom icons
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Default marker icon for fallback (optional)
const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIconRetinaPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom marker icon for the user's location (a red dot as before)
const UserIcon = L.divIcon({
  className: 'user-marker',
  html: '<div style="background-color: red; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [25, 25], // Slightly larger user icon for consistency
  iconAnchor: [12.5, 12.5], // Centered anchor
  popupAnchor: [0, -10],
});

const MedicineStore = () => {
  const [medicineStores, setMedicineStores] = useState([]); // State for medicine store data
  const [pathoLabStores, setPathoLabStores] = useState([]); // State for pathology lab data
  const [userLocation, setUserLocation] = useState(null); // State for user's location
  const [error, setError] = useState(null); // State for error handling
  const [iconSize, setIconSize] = useState([50, 50]); // Dynamic icon size state
  const mapRef = useRef(null); // Ref to access the map instance
  const center = [20.333, 85.821]; // Default center of the map

  // Function to calculate icon size based on zoom level
  const updateIconSize = (zoom) => {
    let size;
    if (zoom >= 15) {
      size = [50, 50]; // Larger size when zoomed in
    } else if (zoom >= 12) {
      size = [40, 40]; // Medium size for mid zoom
    } else if (zoom >= 9) {
      size = [30, 30]; // Smaller size for lower zoom
    } else {
      size = [20, 20]; // Smallest size when zoomed out far
    }
    setIconSize(size);
  };

  // Custom icon for medicine stores (dynamic size based on zoom)
  const MedicineIcon = (size) =>
    L.icon({
      iconUrl: medicineIconPng,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1]], // Adjust anchor to center the icon
      popupAnchor: [0, -size[1]], // Adjust popup position
      shadowUrl: markerShadowPng,
      shadowSize: size,
    });

  // Custom icon for pathology labs (dynamic size based on zoom)
  const PathoLabIcon = (size) =>
    L.icon({
      iconUrl: pathoLabIconPng,
      iconSize: size,
      iconAnchor: [size[0] / 2, size[1]], // Adjust anchor to center the icon
      popupAnchor: [0, -size[1]], // Adjust popup position
      shadowUrl: markerShadowPng,
      shadowSize: size,
    });

  // Load the medicine store data from JSON
  useEffect(() => {
    try {
      console.log('Imported Medicine Store Data:', medicineStoresData);
      if (medicineStoresData && Array.isArray(medicineStoresData)) {
        setMedicineStores(medicineStoresData);
      } else {
        setError('No valid medicine store data found in JSON file');
      }
    } catch (err) {
      console.error('Error loading medicine store data:', err);
      setError('Failed to load medicine store data');
    }
  }, []);

  // Load the pathology lab data from JSON
  useEffect(() => {
    try {
      console.log('Imported PathoLab Store Data:', pathoLabStoresData);
      if (pathoLabStoresData && Array.isArray(pathoLabStoresData)) {
        setPathoLabStores(pathoLabStoresData);
      } else {
        setError('No valid pathology lab data found in JSON file');
      }
    } catch (err) {
      console.error('Error loading pathology lab data:', err);
      setError('Failed to load pathology lab data');
    }
  }, []);

  // Get the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log('User Location:', [latitude, longitude]);
        },
        (err) => {
          console.error('Error getting user location:', err);
          setError('Failed to get user location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  // Update icon size when the map zoom changes
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      updateIconSize(map.getZoom()); // Initial icon size based on default zoom
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        updateIconSize(zoom); // Update icon size on zoom change
      });
    }
  }, [mapRef]);

  return (
    <div className={styles.mapContainer}>
      {error && <div className={styles.error}>{error}</div>}
      <MapContainer
        center={center}
        zoom={15}
        className={styles.map}
        whenCreated={(map) => {
          mapRef.current = map; // Set the map instance to the ref
        }}
      >
        {/* LayersControl to allow toggling between different map styles */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="CartoDB Positron">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://carto.com/attributions">CartoDB</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Stamen Terrain">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.jpg"
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* MarkerClusterGroup for clustering medicine stores */}
        <MarkerClusterGroup
          maxClusterRadius={50}
          disableClusteringAtZoom={15}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="background-color: #4CAF50; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">${count}</div>`,
              className: '',
              iconSize: [40, 40],
            });
          }}
        >
          {/* Render medicine store markers */}
          {medicineStores.length > 0 ? (
            medicineStores.map((store) => (
              <Marker
                key={`medicine-${store.storeid}`}
                position={[store.Latitude, store.Longitude]}
                icon={MedicineIcon(iconSize)}
              >
                <Popup>
                  <b>{store["Store Name"]}</b><br />
                  Type: Medicine Store<br />
                  Area: {store.Area || 'N/A'}<br />
                  Contact: {store["Contact Number"]}<br />
                  Store ID: {store.storeid}
                </Popup>
              </Marker>
            ))
          ) : (
            <div>Loading medicine stores...</div>
          )}
        </MarkerClusterGroup>

        {/* MarkerClusterGroup for clustering pathology labs */}
        <MarkerClusterGroup
          maxClusterRadius={50}
          disableClusteringAtZoom={15}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            return L.divIcon({
              html: `<div style="background-color: #F44336; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold;">${count}</div>`,
              className: '',
              iconSize: [40, 40],
            });
          }}
        >
          {/* Render pathology lab markers */}
          {pathoLabStores.length > 0 ? (
            pathoLabStores.map((lab) => (
              <Marker
                key={`patholab-${lab.storeid}`}
                position={[lab.Latitude, lab.Longitude]}
                icon={PathoLabIcon(iconSize)}
              >
                <Popup>
                  <b>{lab["Store Name"]}</b><br />
                  Type: Pathology Lab<br />
                  Area: {lab.Area || 'N/A'}<br />
                  Contact: {lab["Contact Number"]}<br />
                  Store ID: {lab.storeid}
                </Popup>
              </Marker>
            ))
          ) : (
            <div>Loading pathology labs...</div>
          )}
        </MarkerClusterGroup>

        {/* Render user's location marker (outside clusters) */}
        {userLocation && (
          <Marker position={userLocation} icon={UserIcon}>
            <Popup>You are here!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MedicineStore;
