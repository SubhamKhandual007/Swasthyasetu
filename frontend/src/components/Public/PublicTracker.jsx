import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AmbulanceTracker from '../AdminDashboard/AmbulanceTracker';
import { HeartPulse } from 'lucide-react';

const PublicTracker = () => {
    const { token } = useParams();
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/accident/track/${token}`);
                setAlert(res.data);
            } catch (err) {
                console.error("Error fetching tracking data:", err);
                setError("Invalid or expired tracking link.");
            } finally {
                setLoading(false);
            }
        };

        fetchTrackingData();
        const interval = setInterval(fetchTrackingData, 10000); // 10 second polling for status updates
        return () => clearInterval(interval);
    }, [token]);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <HeartPulse size={48} color="#e74c3c" className="mb-3" style={{ animation: 'pulse 1.5s infinite' }} />
            <h3 style={{ color: '#1e293b' }}>Locating Ambulance...</h3>
        </div>
    );

    if (error) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#e74c3c' }}>Oops!</h2>
            <p style={{ color: '#64748b' }}>{error}</p>
            <a href="/" style={{ color: '#1b558b', fontWeight: 'bold', marginTop: '10px' }}>Back to Home</a>
        </div>
    );

    return (
        <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <header style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#e74c3c', padding: '8px', borderRadius: '10px', color: 'white' }}>
                    <HeartPulse size={20} />
                </div>
                <div>
                   <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>SwasthyaSetu Live</h1>
                   <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Emergency Tracking Feed</p>
                </div>
            </header>
            <main style={{ flexGrow: 1, padding: '10px' }}>
                <AmbulanceTracker alert={alert} />
            </main>
        </div>
    );
};

export default PublicTracker;
