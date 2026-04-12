import API_BASE_URL from '../../../../apiConfig';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BloodDonateReceive.module.css";
import {
  Droplet as BloodIcon,
  User as PersonIcon,
  MapPin as LocationIcon,
  Phone as PhoneIcon,
  AlertTriangle as UrgencyIcon,
  Hospital as RequestIcon,
  Search as SearchIcon,
  Bell as NotificationIcon,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Fix for Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// LocationPicker Component
const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position && position.lat && position.lng ? (
    <Marker position={position}>
      <Popup>
        Pinned Location: Lat {position.lat}, Lng {position.lng}
        <br />
        Click "OK" in the popup to confirm.
      </Popup>
    </Marker>
  ) : null;
};

// Fetch Location Details
const fetchLocationDetails = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || `Lat: ${lat}, Lng: ${lng}`;
  } catch (error) {
    console.error("Error fetching location details:", error);
    return `Lat: ${lat}, Lng: ${lng}`;
  }
};

// CustomMarker Component
const CustomMarker = ({ position, isHighlighted, onClick, children }) => {
  const icon = L.icon({
    iconUrl: isHighlighted
      ? "https://cdn-icons-png.flaticon.com/512/149/149059.png"
      : "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: isHighlighted ? [48, 48] : [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  return position && position.lat && position.lng ? (
    <Marker position={position} icon={icon} eventHandlers={{ click: onClick }}>
      {children}
    </Marker>
  ) : null;
};

// BloodRequestCard Component
const BloodRequestCard = ({ request, onHover, onLeave, isHighlighted, onComplete }) => {
  const bloodGroupColor = {
    "O+": "#4CAF50",
    "O-": "#F44336",
    "A+": "#2196F3",
    "A-": "#3F51B5",
    "B+": "#FF9800",
    "B-": "#E91E63",
    "AB+": "#9C27B0",
    "AB-": "#673AB7",
  };
  return (
    <div
      className={`${styles.requestCard} ${isHighlighted ? styles.highlighted : ""}`}
      style={{ borderLeft: `5px solid ${bloodGroupColor[request.bloodGroup] || "#757575"}` }}
      onMouseEnter={() => onHover(request.id)}
      onMouseLeave={onLeave}
    >
      <h3>{request.patientName}</h3>
      <p>
        <strong>Blood Group:</strong> {request.bloodGroup}{" "}
        <span style={{ color: bloodGroupColor[request.bloodGroup] || "#757575" }}>●</span>
      </p>
      <p>
        <strong>Quantity:</strong> {request.quantity} ml
      </p>
      <p>
        <strong>Priority:</strong> {request.priority}
      </p>
      <p>
        <strong>Location:</strong> {request.location}
      </p>
      <p>
        <strong>Contact:</strong> {request.contact}
      </p>
      <p>
        <strong>Status:</strong> {request.status || "Pending"}
      </p>
      <button
        className={`${styles.actionButton} ${request.status === "Completed" ? styles.completedButton : ""}`}
        onClick={() => {
          if (request.status === "Completed") {
            toast.info("Already Completed");
            return;
          }
          alert(`Contacting ${request.patientName} for ${request.bloodGroup} blood...`);
          onComplete && onComplete(request.id, request);
        }}
      >
        {request.status === "Completed" ? "Request Fulfilled" : "Help Now"}
      </button>
    </div>
  );
};

// Main Component
const BloodDonateReceive = () => {
  const navigate = useNavigate();
  const defaultLocation = { lat: 20.296071, lng: 85.824539 };

  // User Data from LocalStorage
  const [user, setUser] = useState({
    name: "Guest",
    bloodCoins: 0,
    lastDonationDate: null,
    donationsCount: 0,
  });

  // Authentication check and data initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // Allow guest access - no redirect
      console.log("No authenticated user found - rendering as Guest");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser({
      name: userData.userName || userData.name || "User",
      bloodCoins: userData.bloodCoins || 0,
      lastDonationDate: userData.lastDonationDate ? new Date(userData.lastDonationDate) : null,
      donationsCount: userData.donationsCount || 0,
      contact: userData.userEmail || userData.email || "",
    });

    // Pre-fill donor info
    setDonorName(userData.userName || userData.name || "");
    // Use part of email or local phone if available (profile usually has it)
    if (userData.contact) setDonorContact(userData.contact);
  }, [navigate]);

  // State for API Data
  const [donors, setDonors] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Filters and UI
  const [userLocation, setUserLocation] = useState(defaultLocation);
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("All");
  const [highlightedRequestId, setHighlightedRequestId] = useState(null);
  const [requestLocation, setRequestLocation] = useState("");
  const [requestLocationDetails, setRequestLocationDetails] = useState("");
  const [exactLocation, setExactLocation] = useState("");
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // State for Donation Form
  const [donateBloodType, setDonateBloodType] = useState("");
  const [donateQuantity, setDonateQuantity] = useState("");
  const [donateLocation, setDonateLocation] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorContact, setDonorContact] = useState("");

  // State for Request Form (No receipt file)
  const [requestBloodType, setRequestBloodType] = useState("");
  const [requestQuantity, setRequestQuantity] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientContact, setPatientContact] = useState("");
  const [priority, setPriority] = useState("Normal");

  // Fetch Data and Location
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Donors
        const donorResponse = await fetch(`${API_BASE_URL}/api/blood/donations`, {
          credentials: "include",
        });
        if (!donorResponse.ok) throw new Error("Failed to fetch donors.");
        const donorData = await donorResponse.json();
        setDonors(donorData);

        // Fetch Blood Requests
        const requestResponse = await fetch(`${API_BASE_URL}/api/blood/request-blood`, {
          credentials: "include",
        });
        if (!requestResponse.ok) throw new Error("Failed to fetch requests.");
        const requestData = await requestResponse.json();
        setBloodRequests(requestData);

        // Get User Location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newLocation = { lat: latitude, lng: longitude };
            setUserLocation(newLocation);
            fetchLocationDetails(latitude, longitude).then((details) => {
              setRequestLocation(`Lat: ${latitude}, Lng: ${longitude}`);
              setRequestLocationDetails(details);
              setExactLocation(details);
              setDonateLocation(details);
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("Unable to fetch your location. Using default location.");
            fetchLocationDetails(defaultLocation.lat, defaultLocation.lng).then((details) => {
              setRequestLocation(`Lat: ${defaultLocation.lat}, Lng: ${defaultLocation.lng}`);
              setRequestLocationDetails(details);
              setExactLocation(details);
              setDonateLocation(details);
            });
          }
        );
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Requests
  const filteredRequests = bloodRequests.filter((request) => {
    const matchesUrgency = selectedUrgency === "All" || request.priority === selectedUrgency;
    const matchesBloodGroup = selectedBloodGroup === "All" || request.bloodType === selectedBloodGroup;
    return matchesUrgency && matchesBloodGroup;
  });

  // Filter Donors
  const filteredDonors = selectedBloodGroup === "All"
    ? donors
    : donors.filter((donor) => donor.bloodType === selectedBloodGroup);

  // Handle Blood Donation Submission
  const handleDonation = async (e) => {
    e.preventDefault();
    
    // Validate Phone Number
    const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
    if (!phoneRegex.test(donorContact)) {
      toast.error("Enter correct phone number");
      return;
    }

    const donationData = {
      bloodType: donateBloodType,
      quantity: donateQuantity,
      location: donateLocation,
      name: donorName,
      contact: donorContact,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/blood/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donationData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit donation.");
      }
      const result = await response.json();
      toast.success(result.message || "Thank you for your donation!");
      
      // Trigger Notification
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      if (userData) {
        fetch(`${API_BASE_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: userData.userId || userData._id,
            recipientModel: userData.role === 'doctor' ? 'Doctor' : 'User',
            type: 'blood_request',
            title: 'Blood Donation Submitted',
            message: `Thank you for donating ${donateQuantity}ml of ${donateBloodType} blood at ${donateLocation}.`,
            data: { type: 'donation' }
          })
        }).catch(err => console.error("Failed to trigger notification:", err));
      }

      const updatedDonors = await fetch(`${API_BASE_URL}/api/blood/donations`, {
        credentials: "include",
      }).then((res) => res.json());
      setDonors(updatedDonors);
      setDonateBloodType("");
      setDonateQuantity("");
      setDonateLocation(exactLocation);
      setDonorName("");
      setDonorContact("");
    } catch (err) {
      console.error("Error during donation:", err);
      toast.error(err.message);
    }
  };

  // Handle Blood Request Submission (No file upload)
  const handleRequest = async (e) => {
    e.preventDefault();

    // Validate Phone Number
    const phoneRegex = /^(\+91[\-\s]?)?[6789]\d{9}$/;
    if (!phoneRegex.test(patientContact)) {
      toast.error("Enter correct phone number");
      return;
    }

    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;

    const requestData = {
      bloodType: requestBloodType,
      quantity: requestQuantity,
      patientName: patientName,
      location: exactLocation,
      contact: patientContact,
      priority: priority,
      userId: userData ? (userData.userId || userData._id) : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/blood/request-blood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit request.");
      }
      const result = await response.json();
      
      if (result.newRequest && result.newRequest.status === "Not Available") {
        toast.error(result.message);
      } else {
        toast.success(result.message || "Request submitted successfully!");
      }

      // Trigger Notification
      const userStr = localStorage.getItem('user');
      const userData = userStr ? JSON.parse(userStr) : null;
      if (userData) {
        fetch(`${API_BASE_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: userData.userId || userData._id,
            recipientModel: userData.role === 'doctor' ? 'Doctor' : 'User',
            type: 'blood_request',
            title: 'Blood Request Posted',
            message: `Your request for ${requestQuantity}ml of ${requestBloodType} blood has been posted.`,
            data: { type: 'request' }
          })
        }).catch(err => console.error("Failed to trigger notification:", err));
      }

      const updatedRequests = await fetch(`${API_BASE_URL}/api/blood/request-blood`, {
        credentials: "include",
      }).then((res) => res.json());
      setBloodRequests(updatedRequests);
      setRequestBloodType("");
      setRequestQuantity("");
      setPatientName("");
      setPatientContact("");
      setPriority("Normal");
    } catch (err) {
      console.error("Error during request:", err);
      toast.error(err.message);
    }
  };

  const handleMarkCompleted = async (requestId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/blood/mark-request-completed/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to mark completed");
      }

      toast.success("Status updated to Completed");

      const updatedRequests = await fetch(`${API_BASE_URL}/api/blood/request-blood`, {
        credentials: "include",
      }).then((res) => res.json());
      setBloodRequests(updatedRequests);
    } catch (err) {
      console.error("Error marking request completed:", err);
      toast.error(err.message || "Error marking request completed");
    }
  };

  // Handle Location Pinning
  const handleLocationPin = async (latlng) => {
    setPinnedLocation(latlng);
    const details = await fetchLocationDetails(latlng.lat, latlng.lng);
    setRequestLocation(`Lat: ${latlng.lat}, Lng: ${latlng.lng}`);
    setRequestLocationDetails(details);
    setExactLocation(details);
    setDonateLocation(details);
  };

  const handleLocationConfirm = () => {
    if (pinnedLocation) {
      setIsLocationPickerOpen(false);
      setPinnedLocation(null);
    }
  };

  if (loading) return <div className={styles.appContainer}>Loading...</div>;
  if (error) return <div className={styles.appContainer}>Error: {error}</div>;

  return (
    <div className={styles.appContainer}>
      <header className={styles.fixedHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.appTitle}>Swasthya Setu</h1>
          <div className={styles.userProfile}>
            <span className={styles.bloodCoinsHeader}>BloodCoins: {user.bloodCoins}</span>
          </div>
        </div>
      </header>

      <div className={styles.stylishContainer}>
        <div className={styles.stylishContent}>
          {/* Map and Requests */}
          <h2 className={styles.sectionTitle}>Nearby Blood Donation Requests</h2>
          <div className={styles.urgencyFilter}>
            {["All", "Critical", "High", "Normal"].map((urgency) => (
              <button
                key={urgency}
                className={`${styles.filterButton} ${selectedUrgency === urgency ? styles.active : ""}`}
                onClick={() => setSelectedUrgency(urgency)}
              >
                {urgency}
              </button>
            ))}
          </div>
          {userLocation.lat && userLocation.lng && (
            <div className={styles.mapContainer}>
              <MapContainer
                center={userLocation}
                zoom={13}
                zoomControl={false}
                className={styles.stylishMap}
                style={{ height: "300px", width: "100%", borderRadius: "15px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Circle
                  center={userLocation}
                  radius={4300}
                  pathOptions={{
                    color: "#d4a017",
                    fillColor: "#f5e7bc",
                    fillOpacity: 0.5,
                    weight: 3,
                    dashArray: "5, 5",
                  }}
                />
                {filteredRequests.map((request) => (
                  <CustomMarker
                    key={request._id}
                    position={request.location && typeof request.location === "object" ? request.location : userLocation}
                    isHighlighted={highlightedRequestId === request._id}
                    onClick={() => setHighlightedRequestId(request._id)}
                  >
                    <Popup>
                      <strong>{request.patientName}</strong>
                      <br />
                      Blood Group: {request.bloodType}
                      <br />
                      Quantity: {request.quantity} ml
                      <br />
                      Priority: {request.priority}
                      <br />
                      Status: {request.status}
                    </Popup>
                  </CustomMarker>
                ))}
              </MapContainer>
            </div>
          )}

          <div className={styles.requestList}>
            {filteredRequests.map((request) => (
              <BloodRequestCard
                key={request._id}
                request={{
                  id: request._id,
                  patientName: request.patientName,
                  bloodGroup: request.bloodType,
                  quantity: request.quantity,
                  priority: request.priority,
                  location: request.location,
                  contact: request.contact,
                  status: request.status,
                }}
                onHover={() => setHighlightedRequestId(request._id)}
                onLeave={() => setHighlightedRequestId(null)}
                isHighlighted={highlightedRequestId === request._id}
                onComplete={(id) => handleMarkCompleted(id)}
              />
            ))}
          </div>

          {/* Donors Section */}
          <h2 className={styles.sectionTitle}>Available Donors</h2>
          <div className={styles.bloodGroupFilter}>
            {["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
              <button
                key={bg}
                className={`${styles.filterButton} ${selectedBloodGroup === bg ? styles.active : ""}`}
                onClick={() => setSelectedBloodGroup(bg)}
              >
                {bg}
              </button>
            ))}
          </div>
          <div className={styles.donorTableContainer}>
            <table className={styles.stylishDonorTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Quantity (ml)</th>
                  <th>Contact</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor) => (
                  <tr key={donor._id}>
                    <td>{donor.donaerName || donor.name}</td>
                    <td>{donor.bloodType}</td>
                    <td>{donor.quantity}</td>
                    <td>{donor.contact}</td>
                    <td>{donor.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Donate Blood Section */}
          <h2 className={styles.sectionTitle}>Donate Blood</h2>
          <form onSubmit={handleDonation} className={styles.stylishInputGrid}>
            <InputField
              icon={<PersonIcon />}
              label="Donor Name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Enter your name"
            />
            <div className={styles.inputField}>
              <div className={styles.inputIcon}><BloodIcon /></div>
              <select
                className={styles.selectInput}
                value={donateBloodType}
                onChange={(e) => setDonateBloodType(e.target.value)}
                required
              >
                <option value="">Select Blood Type</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <InputField
              icon={<BloodIcon />}
              label="Quantity (ml)"
              value={donateQuantity}
              onChange={(e) => setDonateQuantity(e.target.value)}
              placeholder="e.g., 450"
            />
            <div className={styles.locationField}>
              <div className={styles.inputIcon}><LocationIcon /></div>
              <input
                type="text"
                value={donateLocation}
                onChange={(e) => setDonateLocation(e.target.value)}
                className={styles.input}
                placeholder="Enter donation location"
              />
              <button type="button" className={styles.pinButton} onClick={() => setIsLocationPickerOpen(true)}>Pin Location</button>
            </div>
            <InputField
              icon={<PhoneIcon />}
              label="Contact"
              value={donorContact}
              onChange={(e) => setDonorContact(e.target.value)}
              placeholder="Enter contact info"
            />
            <button type="submit" className={styles.actionButton}>
              <BloodIcon className={styles.buttonIcon} /> Donate Blood
            </button>
          </form>

          {/* Request Blood Section (No file upload) */}
          <h2 className={styles.sectionTitle}>Request Blood</h2>
          <form onSubmit={handleRequest} className={styles.stylishInputGrid}>
            <InputField
              icon={<PersonIcon />}
              label="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
            <div className={styles.inputField}>
              <div className={styles.inputIcon}><BloodIcon /></div>
              <select
                className={styles.selectInput}
                value={requestBloodType}
                onChange={(e) => setRequestBloodType(e.target.value)}
                required
              >
                <option value="">Select Blood Type</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.locationField}>
              <div className={styles.inputIcon}><LocationIcon /></div>
              <input
                type="text"
                value={requestLocation}
                onChange={(e) => setRequestLocation(e.target.value)}
                className={styles.input}
                placeholder="Pin hospital location"
                readOnly
              />
              <button type="button" className={styles.pinButton} onClick={() => setIsLocationPickerOpen(true)}>Pin Location</button>
            </div>
            <InputField
              icon={<LocationIcon />}
              label="Exact Location"
              value={exactLocation}
              onChange={(e) => setExactLocation(e.target.value)}
              placeholder="Enter exact address"
            />
            <InputField
              icon={<PhoneIcon />}
              label="Contact"
              value={patientContact}
              onChange={(e) => setPatientContact(e.target.value)}
              placeholder="Enter contact info"
            />
            <InputField
              icon={<BloodIcon />}
              label="Quantity (ml)"
              value={requestQuantity}
              onChange={(e) => setRequestQuantity(e.target.value)}
              placeholder="e.g., 450"
            />
            <div className={styles.inputField}>
              <div className={styles.inputIcon}><UrgencyIcon /></div>
              <select className={styles.selectInput} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <button type="submit" className={styles.actionButton}>
              <RequestIcon className={styles.buttonIcon} /> Request Blood
            </button>
          </form>

          {/* Location Picker Modal */}
          {isLocationPickerOpen && userLocation.lat && userLocation.lng && (
            <div className={styles.modalOverlay}>
              <div className={styles.stylishModalContent}>
                <h3 className={styles.modalTitle}>Pin Your Location</h3>
                <MapContainer
                  center={userLocation}
                  zoom={13}
                  zoomControl={false}
                  style={{ height: "300px", width: "100%", borderRadius: "15px" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <LocationPicker onLocationSelect={handleLocationPin} initialLocation={userLocation} />
                </MapContainer>
                <div className={styles.modalButtons}>
                  <button className={styles.actionButton} onClick={handleLocationConfirm}>OK</button>
                  <button className={styles.cancelButton} onClick={() => setIsLocationPickerOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notifications */}
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

// InputField Component
const InputField = ({ icon, label, value, placeholder, readOnly, onChange }) => (
  <div className={styles.inputField}>
    <div className={styles.inputIcon}>{icon}</div>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={styles.input}
      readOnly={readOnly}
    />
  </div>
);

export default BloodDonateReceive;
