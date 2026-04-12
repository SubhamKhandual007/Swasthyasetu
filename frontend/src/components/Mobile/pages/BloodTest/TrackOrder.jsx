import API_BASE_URL from '../../../../apiConfig';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, CheckCircle, Truck, FileText, Download, Loader } from "lucide-react";

const TrackOrder = () => {
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestTest = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : { _id: "guest" };
        const userId = user._id || user.userId || "guest";

        const response = await axios.get(`${API_BASE_URL}/api/blood-tests/my-tests/${userId}`);
        if (response.data && response.data.length > 0) {
          // Get the most recent test
          const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setTestData(sorted[0]);
        } else {
          setError("No active tests found.");
        }
      } catch (err) {
        console.error("Error fetching test tracking:", err);
        setError("Failed to fetch tracking data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTest();
    const interval = setInterval(fetchLatestTest, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const getProgress = (status) => {
    switch (status) {
      case "Pending": return 30;
      case "Processing": return 60;
      case "Completed": return 100;
      default: return 10;
    }
  };

  const trackingSteps = [
    { step: "Order Placed", status: testData ? "completed" : "pending", time: testData ? new Date(testData.createdAt).toLocaleTimeString() : "" },
    { step: "Lab Confirmed", status: testData ? "completed" : "pending" },
    { step: "Sample Collected", status: testData?.status === "Processing" || testData?.status === "Completed" ? "completed" : "pending" },
    { step: "Report Ready", status: testData?.status === "Completed" ? "completed" : "pending" },
  ];

  const handleDownloadReport = () => {
    if (testData?.status === "Completed") {
      alert("Downloading report for " + testData.tests.map(t => t.name).join(", "));
    } else {
      alert("Report is not ready yet!");
    }
  };

  if (loading) return <div className="text-center mt-5"><Loader className="spinner-border text-primary" /> Loading tracking...</div>;
  if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
  if (!testData) return <div className="text-center mt-5">No active tests found to track.</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: "480px", paddingBottom: "80px" }}>
      <h1 className="text-center mb-4" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2c3e50" }}>Track Your Order</h1>

      {/* Order Summary Card */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: "15px", border: "none", background: "#fff" }}>
        <div className="card-body">
          <h5 className="card-title" style={{ fontWeight: 700, color: "#2c3e50" }}>Order #{testData._id.slice(-6).toUpperCase()}</h5>
          <div className="card-text" style={{ color: "#34495e" }}>
            <p className="mb-3"><strong>Tests:</strong> {testData.tests.map(t => t.name).join(", ")}</p>
            <p className="mb-3"><strong>Lab:</strong> {testData.labName}</p>
            <p className="mb-3"><strong>Date:</strong> {new Date(testData.createdAt).toLocaleDateString()}</p>
            <p className="mb-0"><strong>Status:</strong> {testData.status}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <h5 className="mb-2" style={{ fontWeight: 600 }}>Progress</h5>
        <h4 className="mb-2" style={{ fontWeight: 700 }}>{getProgress(testData.status)}%</h4>
        <div className="progress" style={{ height: "10px", borderRadius: "5px", background: "#e9ecef" }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${getProgress(testData.status)}%`, borderRadius: "5px" }}
            aria-valuenow={getProgress(testData.status)}
            aria-valuemin="0"
            aria-valuemax="100"
          >
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="card shadow-sm" style={{ borderRadius: "15px", border: "none", background: "#fff" }}>
        <div className="card-body">
          <h5 className="card-title mb-4" style={{ fontWeight: 600 }}>Order Status</h5>
          <div className="timeline-container">
            {trackingSteps.filter(s => s.step !== "Report Ready").map((step, index) => (
              <div key={index} className="d-flex mb-4 position-relative">
                {/* Vertical Line */}
                {index < 3 && (
                  <div style={{
                    position: "absolute",
                    left: "14px",
                    top: "30px",
                    width: "2px",
                    height: "calc(100% + 8px)",
                    background: step.status === "completed" && trackingSteps[index+1].status === "completed" ? "#27ae60" : "#e9ecef",
                    zIndex: 1
                  }}></div>
                )}
                
                {/* Icon/Circle */}
                <div className="me-3 position-relative" style={{ zIndex: 2 }}>
                  {step.status === "completed" ? (
                    <div style={{ background: "#27ae60", borderRadius: "50%", padding: "5px", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                      <CheckCircle size={18} color="#fff" />
                    </div>
                  ) : (
                    <div style={{ 
                      width: "28px", 
                      height: "28px", 
                      borderRadius: "50%", 
                      background: "#fff", 
                      border: "2px solid #e9ecef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <div className="d-flex flex-column">
                    <strong style={{ color: "#2c3e50", fontSize: "1.05rem", marginBottom: "2px" }}>{step.step}</strong>
                    {step.status === "completed" ? (
                      <>
                        <span className="text-success small" style={{ fontWeight: 500 }}>Completed</span>
                        <span className="text-success small" style={{ fontWeight: 500 }}>Completed• {step.time}</span>
                      </>
                    ) : (
                      <span className="text-muted small">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {testData.status === "Completed" && (
        <div className="mt-4 text-center">
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={handleDownloadReport}
          >
            <Download className="me-2" size={20} />
            Download Report
          </button>
        </div>
      )}
      <div className="mt-2 text-center">
        <button className="btn btn-outline-secondary w-100">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default TrackOrder;
