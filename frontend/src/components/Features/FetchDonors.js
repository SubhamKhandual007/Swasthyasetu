import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FetchDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Fetch the blood requests data
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blood/donations`, {
          credentials: "include", // Include credentials if needed
        });

        if (!response.ok) {
          throw new Error("Failed to fetch requests.");
        }

        const data = await response.json();
        setDonors(data); // Assuming the data is an array
      } catch (err) {
        console.error("Error fetching donors details:", err);
        setError("Failed to fetch donors details."); // Set error state
        toast.error("Failed to fetch donors details.");
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchDonors();
  }, []); // Empty dependency array to run once on mount

  if (loading) {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4" style={{ color: "#1b558b" }}>
          Blood Donors
        </h2>
        <p className="text-center">Loading...</p> {/* Show loading message */}
        <ToastContainer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4" style={{ color: "#1b558b" }}>
          Blood Donors
        </h2>
        <p className="text-center text-danger">{error}</p>{" "}
        {/* Show error message */}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "#1b558b" }}>
        Blood Donors
      </h2>

      {/* Display the fetched requests in a responsive table */}
      <div className="table-responsive">
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Blood Type</th>
              <th>Quantity (ml)</th>
              <th>Donor Name</th>
              <th>Location</th>
              <th>Contact</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No blood Donors available.
                </td>
              </tr>
            ) : (
              donors.map((donor) => (
                <tr key={donor._id}>
                  <td>{donor.bloodType}</td>
                  <td>{donor.quantity}</td>
                  <td>{donor.name}</td>
                  <td>{donor.location}</td>
                  <td>{donor.contact}</td>
                  <td>{donor.priority}</td>
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

export default FetchDonors;
