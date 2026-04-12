import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function BloodRequestList() {
  const [requests, setRequests] = useState([]);  // Store fetched requests
  const [error, setError] = useState(null);  // Handle errors
  const [loading, setLoading] = useState(true);  // Handle loading state

  // Fetch blood requests from the API when the component mounts
  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        setLoading(true);  // Start loading
        const response = await fetch(`${API_BASE_URL}/api/blood/request-blood`);  // Fetch the blood requests
        if (!response.ok) {
          throw new Error('Failed to fetch blood requests');
        }
        const data = await response.json();  // Parse the JSON data
        setRequests(data);  // Store the fetched data in the state
      } catch (err) {
        setError(err.message);  // Handle errors
      } finally {
        setLoading(false);  // Stop loading
      }
    };

    fetchBloodRequests();  // Call the function to fetch data
  }, []);  // Empty dependency array means this will run only once

  // Function to handle access of a blood request
  const handleAccessRequest = async (requestId) => {
    try {
      // Check if the request is already accessed
      const request = requests.find(req => req._id === requestId);
      if (request && request.accessed) {
        toast.info('This request has already been accessed.');
        return;  // Do nothing if the request is already accessed
      }

      // Send request to backend to mark the request as accessed
      const response = await fetch(`${API_BASE_URL}/api/blood/mark-request-accessed/${requestId}`, {
        method: 'PATCH',  // Use PATCH method to update the request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update the request');
      }

      // Update the requests state with the updated request
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request._id === requestId ? { ...request, accessed: true, status: 'Accessed' } : request
        )
      );

      toast.success('Request accessed successfully!');
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div className="container" style={{ marginTop: "150px" }}>
      <h2 className="text-center mb-4">Blood Requests</h2>

      {/* Show loading message */}
      {loading && <div className="text-center"><p>Loading blood requests...</p></div>}

      {/* Show error message if any */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Display blood requests in a responsive table */}
      <div className="table-responsive">
        <table className="table table-hover table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Blood Type</th>
              <th>Quantity Requested (ml)</th>
              <th>Patient Name</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No blood requests found.</td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.bloodType}</td>
                  <td>{request.quantity}</td>
                  <td>{request.patientName}</td>
                  <td>{request.contact}</td>
                  <td>{request.location}</td>
                  <td>{request.priority}</td>
                  <td>{request.status}</td>
                  <td>
                    {/* Render "Click to Access" button only if request has not been accessed */}
                    {!request.accessed ? (
                      <button 
                        className="btn btn-info"
                        onClick={() => handleAccessRequest(request._id)}
                      >
                        Click to Access
                      </button>
                    ) : (
                      <button className="btn btn-success" disabled>
                        Accessed
                      </button>
                    )}
                  </td>
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

export default BloodRequestList;
