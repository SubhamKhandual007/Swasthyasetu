import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FetchRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Fetch the blood requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blood/request-blood`, {
          credentials: 'include', // Include credentials if needed
        });

        if (!response.ok) {
          throw new Error('Failed to fetch requests.');
        }

        const data = await response.json();
        setRequests(data); // Assuming the data is an array
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to fetch requests.'); // Set error state
        toast.error('Failed to fetch requests.');
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchRequests();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4" style={{ color: '#1b558b' }}>
          Blood Requests
        </h2>
        <p className="text-center">Loading...</p> {/* Show loading message */}
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4" style={{ color: '#1b558b' }}>
          Blood Requests
        </h2>
        <p className="text-center text-danger">{error}</p> {/* Show error message */}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: '#1b558b' }}>
        Blood Requests
      </h2>

      {/* Display the fetched requests in a responsive table */}
      <div className="table-responsive">
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Quantity (ml)</th>
              <th>Patient Name</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Requested At</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No blood requests available.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.bloodType}</td>
                  <td>{request.quantity}</td>
                  <td>{request.patientName}</td>
                  <td>{request.location}</td>
                  <td>{request.contact}</td>
                  <td>{request.priority}</td>
                  <td>
                    {/* Display appropriate status */}
                    {request.status === 'Pending' && (
                      <span className="text-warning">Pending request</span>
                    )}
                    {request.status !== 'Pending' && (
                      <span className="text-success">Accessed, you can collect it from your location</span>
                    )}
                  </td>
                  <td>{new Date(request.requestedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default FetchRequest;
