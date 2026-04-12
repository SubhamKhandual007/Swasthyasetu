import API_BASE_URL from '../../apiConfig';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for accident and doctor locations
const accidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const doctorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Accidents() {
  const [accidents, setAccidents] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ location: null, coordinates: [0, 0] });
  const [isLoading, setIsLoading] = useState(false);
  const [doctorLocation, setDoctorLocation] = useState(null);

  // Fetch accidents data from the backend
  const fetchAccidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accident/accidents`);
      if (response.ok) {
        const data = await response.json();

        // Check localStorage for disabled states and update data accordingly
        const updatedAccidents = data.accidents.map((accident) => ({
          ...accident,
          isDisabled: localStorage.getItem(`accident_${accident._id}`) === 'true',
        }));

        setAccidents(updatedAccidents || []);
      } else {
        toast.error('Failed to fetch accidents. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching accidents:', error);
      toast.error('Error fetching accidents. Please try again later.');
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

  // Handle Checkout Button Click
  const handleCheckout = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accident/accidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Checkout' }), // Changed to match schema enum
        credentials: 'include', // Added for session authentication if required
      });

      if (response.ok) {
        const updatedAccident = await response.json();

        // Update local state
        setAccidents((prevAccidents) =>
          prevAccidents.map((accident) =>
            accident._id === updatedAccident._id ? updatedAccident : accident
          )
        );

        // Save the disabled state in localStorage
        localStorage.setItem(`accident_${id}`, true);

        toast.success('Accident checked out successfully.');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to update status: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating accident:', error);
      toast.error('Error updating accident. Please try again.');
    }
  };

  // Handle Track Button Click
  const handleTrack = async (location) => {
    setIsLoading(true);
    const coordinates = await getCoordinates(location);
    setSelectedLocation({ location, coordinates });
    setShowMap(true);
    setIsLoading(false);
  };

  // Handle Doctor's Location Button Click
  const handleDoctorLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDoctorLocation([latitude, longitude]);
        },
        (error) => {
          toast.error('Error fetching your location. Please enable location services.');
          console.error('Error fetching location:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  // Close the Map Modal
  const closeMap = () => {
    setShowMap(false);
    setSelectedLocation({ location: null, coordinates: [0, 0] });
    setDoctorLocation(null);
  };

  // Convert time to a readable format
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Fetch coordinates using Nominatim API
  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        toast.error(`Location "${location}" not found.`);
        return [0, 0]; // Default to [0, 0] if location not found
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      toast.error('Error fetching coordinates. Please try again.');
      return [0, 0]; // Default to [0, 0] in case of an error
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
        padding: '20px',
      }}
    >
      <h2
        className="text-center mb-4"
        style={{ color: '#1b558b', fontSize: '24px', fontWeight: 'bold' }}
      >
        Accident Management
      </h2>
      <div
        className="card shadow-lg border-0 rounded-3 card-animate"
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflowY: 'auto',
        }}
      >
        <div className="card-body">
          <h3 className="card-title mb-4" style={{ color: '#1b558b' }}>
            List of Accidents
          </h3>
          <ul className="list-group list-group-flush">
            {accidents.length > 0 ? (
              accidents.map((accident) => (
                <li
                  key={accident._id}
                  className="list-group-item bg-light rounded-3 shadow-sm mb-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                  }}
                >
                  <div>
                    <strong style={{ color: '#1b558b', fontSize: '18px' }}>
                      {accident.location}, {accident.city}, {accident.state}
                    </strong>
                    <p style={{ marginBottom: '5px' }}>{accident.description}</p>
                    <small className="text-muted">Reported at: {formatTime(accident.time)}</small>
                    <br />
                    <span
                      className={`badge ${accident.status === 'Pending' ? 'bg-warning' : 'bg-success'
                        }`}
                      style={{ fontSize: '14px', marginTop: '10px' }}
                    >
                      {accident.status}
                    </span>
                  </div>
                  <div>
                    {/* Conditional Rendering for Buttons */}
                    {accident.status !== 'Checked Out' && !accident.isDisabled && (
                      <>
                        <button
                          className="btn btn-primary me-2"
                          style={{
                            backgroundColor: '#1b558b',
                            border: 'none',
                            padding: '10px 20px',
                          }}
                          onClick={() => handleCheckout(accident._id)}
                        >
                          Mark as Checked Out
                        </button>
                        <button
                          className="btn btn-info"
                          style={{
                            padding: '10px 20px',
                          }}
                          onClick={() => handleTrack(accident.location)}
                        >
                          Track
                        </button>
                      </>
                    )}
                    {accident.isDisabled && (
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '10px 20px',
                        }}
                        disabled
                      >
                        Already Checked Out
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="list-group-item text-center">
                No accidents reported yet.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && selectedLocation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '80%',
              maxWidth: '800px',
              position: 'relative',
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
              }}
              onClick={closeMap}
            >
              ×
            </button>
            <h3 style={{ marginBottom: '20px' }}>Location: {selectedLocation.location}</h3>
            <button
              className="btn btn-success mb-3"
              style={{
                padding: '10px 20px',
              }}
              onClick={handleDoctorLocation}
            >
              Your Location
            </button>
            <div style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
              <MapContainer
                center={selectedLocation.coordinates}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={selectedLocation.coordinates} icon={accidentIcon}>
                  <Popup>{selectedLocation.location}</Popup>
                </Marker>
                {doctorLocation && (
                  <>
                    <Marker position={doctorLocation} icon={doctorIcon}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    <Polyline
                      positions={[doctorLocation, selectedLocation.coordinates]}
                      color="red"
                    />
                  </>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Loading map...</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Accidents;
