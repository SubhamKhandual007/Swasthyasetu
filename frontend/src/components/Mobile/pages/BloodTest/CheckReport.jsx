import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText as ReportIcon } from "lucide-react";

const CheckReport = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4" style={{ maxWidth: "480px" }}>
      <h1 className="text-center mb-4">Check Your Report</h1>
      <div className="card shadow-sm p-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">Report Details</h5>
          <p className="card-text">
            <ReportIcon className="me-2" /> Report Status: Ready
          </p>
          <p className="card-text">Your blood test report is available. View or download it below.</p>
          <button
            className="btn btn-success w-100 mt-3"
            onClick={() => navigate("/download-report")}
          >
            <ReportIcon className="me-2" /> View Report
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

export default CheckReport;
