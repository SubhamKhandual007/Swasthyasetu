import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText as ReportIcon, Download as DownloadIcon } from "lucide-react";
import { toast } from "react-toastify";

const DownloadReport = () => {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.success("Report downloaded successfully!");
    navigate("/check-report");
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "480px" }}>
      <h1 className="text-center mb-4">Download Your Report</h1>
      <div className="card shadow-sm p-3 mb-4">
        <div className="card-body">
          <h5 className="card-title">Report Download</h5>
          <p className="card-text">
            <ReportIcon className="me-2" /> Report Status: Ready
          </p>
          <p className="card-text">Click below to download your blood test report (PDF format).</p>
          <button
            className="btn btn-primary w-100 mt-3"
            onClick={handleDownload}
          >
            <DownloadIcon className="me-2" /> Download Report
          </button>
          <button
            className="btn btn-secondary w-100 mt-3"
            onClick={() => navigate("/check-report")}
          >
            Back to Check Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadReport;
