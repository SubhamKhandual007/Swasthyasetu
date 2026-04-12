import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Calendar, Clock, Video, MapPin } from "lucide-react";
import styles from "./NutritionistAppointments.module.css";

const NutritionistAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = JSON.parse(localStorage.getItem("nutritionistAppointments")) || [];
    setAppointments(savedAppointments);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedAppointments = JSON.parse(localStorage.getItem("nutritionistAppointments")) || [];
      setAppointments(savedAppointments);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCancelAppointment = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      const updatedAppointments = appointments.filter((appointment) => appointment.bookingId !== bookingId);
      setAppointments(updatedAppointments);
      localStorage.setItem("nutritionistAppointments", JSON.stringify(updatedAppointments));
      toast.success("Appointment cancelled successfully!");
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const closePopup = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>Nutritionist Appointments</h1>
      </div>

      <div className={styles.appointmentsSection}>
        {appointments.length === 0 ? (
          <p>No appointments booked yet.</p>
        ) : (
          <div className={styles.appointmentsGrid}>
            {appointments.map((appointment, index) => (
              <div
                key={index}
                className={styles.appointmentCard}
                onClick={() => handleViewDetails(appointment)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.appointmentDetails}>
                  <h3>{appointment.nutritionistName}</h3>
                  <p><strong>Type:</strong> {appointment.type === "online" ? "Online" : "In-Person"}</p>
                  <p><strong>Date:</strong> {appointment.date}</p>
                  <p><strong>Time:</strong> {appointment.time}</p>
                  {appointment.type === "inPerson" && (
                    <p><strong>Location:</strong> {appointment.location.address}</p>
                  )}
                  <p><strong>Fees:</strong> ₹{appointment.fees}</p>
                </div>
                <button
                  className={styles.cancelButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering handleViewDetails
                    handleCancelAppointment(appointment.bookingId);
                  }}
                  title="Cancel Appointment"
                >
                  <X size={18} color="#e74c3c" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.backButtonContainer}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/nutrition-diet-plan")}
        >
          Back to Nutrition & Diet Plan
        </button>
      </div>

      {/* Appointment Details Popup */}
      {selectedAppointment && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupTitle}>Appointment Details</h3>
            <p className={styles.popupDetail}>
              <span>Nutritionist Name:</span> <span>{selectedAppointment.nutritionistName}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>Type:</span> <span>{selectedAppointment.type === "online" ? "Online" : "In-Person"}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>Date:</span> <span>{selectedAppointment.date}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>Time:</span> <span>{selectedAppointment.time}</span>
            </p>
            {selectedAppointment.type === "inPerson" && (
              <p className={styles.popupDetail}>
                <span>Location:</span> <span>{selectedAppointment.location.address}</span>
              </p>
            )}
            <p className={styles.popupDetail}>
              <span>Fees:</span> <span>₹{selectedAppointment.fees}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>Booking ID:</span> <span>{selectedAppointment.bookingId}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>User Name:</span> <span>{selectedAppointment.userName}</span>
            </p>
            <p className={styles.popupDetail}>
              <span>Email:</span> <span>{selectedAppointment.email}</span>
            </p>
            <div className={styles.popupButtons}>
              <button className={styles.closeButton} onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default NutritionistAppointments;
