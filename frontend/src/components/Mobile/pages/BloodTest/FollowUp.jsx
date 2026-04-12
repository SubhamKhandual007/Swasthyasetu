import React from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope as DoctorIcon } from "lucide-react";

const FollowUp = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4" style={{ maxWidth: "480px" }}>
      <h1 className="text-center mb-4">Doctor Follow-Up</h1>
      <div className="card shadow-sm p-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">Schedule a Follow-Up</h5>
          <p className="card-text">
            <DoctorIcon className="me-2" /> Your report is ready. Schedule a consultation with a doctor for analysis and recommendations.
          </p>
          <button
            className="btn btn-success w-100 mt-3"
            onClick={() => navigate("/doctor-consultation")}
          >
            <DoctorIcon className="me-2" /> Schedule Consultation
          </button>
          <button
            className="btn btn-primary w-100 mt-3"
            onClick={() => navigate("/blood-test")}
          >
            Back to Blood Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUp;
