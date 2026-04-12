import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Ambulance, Clock, MapPin, Share2, CheckCircle, Navigation, ShieldAlert, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './AmbulanceTracker.module.css';

// Fix for Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const ambulanceIcon = L.divIcon({
  html: `<div class="${styles.ambulanceMarker}"><img src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" width="30" height="30" /></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const patientIcon = L.divIcon({
  html: `<div class="${styles.patientMarker}"><div class="${styles.pulse}"></div><img src="https://cdn-icons-png.flaticon.com/512/2802/2802730.png" width="25" height="25" /></div>`,
  className: '',
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
});

// Map Component to handle flying to coordinates
const MapController = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 15);
    }
  }, [coords, map]);
  return null;
};

const AmbulanceTracker = ({ alert, onClose }) => {
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [eta, setEta] = useState('Calculating...');
  const [status, setStatus] = useState(alert.status || 'Assigning');
  const [isEmergencyMode, setIsEmergencyMode] = useState(true);
  const [distance, setDistance] = useState(0);

  const patientPos = alert.coordinates ? [alert.coordinates.lat, alert.coordinates.lng] : [20.2961, 85.8245];

  // Initialize ambulance position somewhere nearby
  useEffect(() => {
    if (!ambulancePos) {
      setAmbulancePos([
        patientPos[0] + 0.02,
        patientPos[1] + 0.02
      ]);
    }
  }, [patientPos, ambulancePos]);

  // Simulate Movement and Update Status
  useEffect(() => {
    if (!ambulancePos) return;

    const interval = setInterval(() => {
      setAmbulancePos(prev => {
        const dLat = (patientPos[0] - prev[0]) * 0.1;
        const dLng = (patientPos[1] - prev[1]) * 0.1;
        
        const newLat = prev[0] + dLat;
        const newLng = prev[1] + dLng;

        // Calculate distance in KM
        const dist = Math.sqrt(Math.pow(patientPos[0] - newLat, 2) + Math.pow(patientPos[1] - newLng, 2)) * 111;
        setDistance(dist);

        // Update ETA (simulated: 2 mins per KM)
        const newEta = Math.ceil(dist * 2);
        setEta(newEta <= 0 ? 'Arrived' : `${newEta} mins`);

        // Smart Alert logic
        if (newEta === 2 && status !== 'Near You') {
            toast.info("Ambulance is 2 minutes away! Prepare the patient.", { autoClose: 5000 });
            handleStatusUpdate('Near You');
        }

        if (dist < 0.01 && status !== 'Reached') {
            handleStatusUpdate('Reached');
            toast.success("Ambulance has reached the location.");
        }

        return [newLat, newLng];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [patientPos, ambulancePos, status]);

  const handleStatusUpdate = async (newStatus) => {
      setStatus(newStatus);
      try {
          await axios.put(`${API_BASE_URL}/api/accident/accidents/${alert._id}`, { status: newStatus });
      } catch (err) {
          console.error("Failed to sync status:", err);
      }
  };

  const shareTrackingLink = () => {
      const shareUrl = `${window.location.origin}/track/${alert.trackingToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success("Tracking link copied to clipboard! Share it with family.");
  };

  const timelineSteps = [
    { key: 'Pending', label: 'Booking Confirmed', icon: <CheckCircle size={14} /> },
    { key: 'Ambulance Enroute', label: 'Ambulance Dispatched', icon: <Navigation size={14} /> },
    { key: 'Near You', label: 'Near You', icon: <Zap size={14} /> },
    { key: 'Reached', label: 'Reached', icon: <MapPin size={14} /> }
  ];

  const currentStepIndex = timelineSteps.findIndex(s => s.key === status);

  return (
    <div className={styles.container}>
      <div className={styles.mapWrapper}>
        <MapContainer center={patientPos} zoom={15} className={styles.map}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={patientPos} icon={patientIcon}>
             <Popup>Patient Location: {alert.location}</Popup>
          </Marker>
          {ambulancePos && (
            <Marker position={ambulancePos} icon={ambulanceIcon}>
                <Popup>Ambulance Enroute</Popup>
            </Marker>
          )}
          <MapController coords={ambulancePos} />
        </MapContainer>

        <div className={styles.overlay}>
             <div className={styles.etaCard}>
                <Clock className={styles.etaIcon} />
                <div>
                   <span className={styles.etaLabel}>Estimated Arrival</span>
                   <h2 className={styles.etaValue}>{eta}</h2>
                </div>
             </div>

             <div className={styles.controls}>
                <button 
                    className={`${styles.modeBtn} ${isEmergencyMode ? styles.active : ''}`}
                    onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                >
                    <ShieldAlert size={16} className="me-2" />
                    Emergency Mode: {isEmergencyMode ? 'ON' : 'OFF'}
                </button>
                <button className={styles.shareBtn} onClick={shareTrackingLink}>
                    <Share2 size={16} />
                </button>
             </div>
        </div>
      </div>

      <div className={styles.infoPanel}>
         <div className={styles.timeline}>
            {timelineSteps.map((step, index) => (
                <div key={step.key} className={`${styles.timelineStep} ${index <= currentStepIndex ? styles.activeStep : ''}`}>
                    <div className={styles.stepIcon}>{step.icon}</div>
                    <span className={styles.stepLabel}>{step.label}</span>
                    {index < timelineSteps.length - 1 && <div className={styles.connector}></div>}
                </div>
            ))}
         </div>

         <div className={styles.details}>
            <div className={styles.detailItem}>
                <span className={styles.label}>Ambulance ID</span>
                <span className={styles.value}>AMB-2026-0042</span>
            </div>
            <div className={styles.detailItem}>
                <span className={styles.label}>Driver</span>
                <span className={styles.value}>Rajesh Kumar • +91 9876543210</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AmbulanceTracker;
