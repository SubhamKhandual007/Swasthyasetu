import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PatientProfile.module.css';

const PatientProfile = ({ patientId }) => {
    // Mock patient data for demonstration
    const mockPatientData = {
        name: "gudu",
        dob: "1990-01-15",
        gender: "Male",
        bloodType: "O+",
        phone: "+1 123 456 7890",
        emergencyName: "John Doe",
        emergencyPhone: "+1 987 654 3210",
        address: "123 Street, City, Country",
        occupation: "Engineer",
        insuranceProvider: "ABC Insurance",
        insurancePolicyNumber: "POL123456",
        lastDonationDate: "2023-06-15",
        totalDonations: 5,
        eligibleForDonation: true,
        bloodPressure: "120/80",
        weight: 70,
        height: 175,
        chronicConditions: [],
        surgeries: false,
        surgeryDetails: "",
        medicationAllergies: [],
        otherAllergies: "",
        familyHistory: [],
        otherFamilyHistory: "",
        currentMeds: false,
        medsList: [],
        pastMeds: "",
        ongoingTherapies: [],
        ongoingTherapiesOthers: "",
        bloodReport: null,
        imagingReport: null,
        geneticOrBiopsyTest: false,
        polioVaccine: true,
        tetanusShot: "2020-05-10",
        covidVaccine: "Fully Vaccinated",
        covidBooster: true,
        smokingStatus: "Never",
        cigarettesPerDay: 0,
        exerciseFrequency: "Regularly",
        sleepHours: 7,
        dietType: ["Vegetarian"],
        dietTypeOther: "",
        alcoholConsumption: "Occasionally",
        alcoholFrequency: "Once a week",
        primarySymptoms: "None",
        initialDiagnosis: "Healthy",
        followUpRequired: false,
        followUpDate: null
    };

    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/patients/${patientId}`, {
                    withCredentials: true,
                });
                console.log(response.data);
                setPatientData(response.data);
                setLoading(false);
            } catch (err) {
                // Use mock data if API fails (for demonstration)
                console.log("Using mock patient data");
                setPatientData(mockPatientData);
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPatientData();
        } else {
            // If no patientId provided, use mock data for demonstration
            setPatientData(mockPatientData);
            setLoading(false);
        }
    }, [patientId]);

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    };

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 'Born in future';
    };

    if (loading) return <div className={styles.loading}>Loading patient data...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!patientData) return <div className={styles.noData}>No patient data available.</div>;

    const baseUrl = `${API_BASE_URL}`; // Base URL for file paths

    return (
        <div className={styles.profileContainer}>
            {/* Patient Summary Description */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Patient Summary</h2>
                <p>
                    {patientData.name}, born on {formatDate(patientData.dob)}, is a {patientData.gender.toLowerCase()} with a {patientData.bloodType} blood group, currently listed as {patientData.occupation ? `a ${patientData.occupation.toLowerCase()}` : 'having no specified occupation'}.
                    Being {calculateAge(patientData.dob)} years old, they have donated blood {patientData.totalDonations} time(s), with the last donation on {formatDate(patientData.lastDonationDate)}, and {patientData.eligibleForDonation ? 'remain eligible' : 'are not eligible'} for future donations.
                    Their recorded weight is {patientData.weight} kg, height is {patientData.height} cm, and blood pressure is {patientData.bloodPressure || 'not specified'}.
                    {patientData.chronicConditions?.length > 0 && ` They have a history of ${patientData.chronicConditions.join(', ').toLowerCase()} as chronic condition(s).`}
                    {patientData.familyHistory?.length > 0 && ` Their family history includes a risk of ${patientData.familyHistory.join(', ').toLowerCase()}.`}
                </p>
                <p>
                    {patientData.surgeries ? `They have had previous surgeries (${patientData.surgeryDetails || 'details not specified'})` : 'They report no previous surgeries'} and {patientData.medicationAllergies?.length > 0 ? `are allergic to ${patientData.medicationAllergies.join(', ').toLowerCase()}` : 'have no medication allergies'}.
                    Currently, they are {patientData.currentMeds ? `taking medications (${patientData.medsList?.length > 0 ? patientData.medsList.join(', ') : 'list not specified'})` : 'not on any medications'}, with {patientData.pastMeds ? `past medications including ${patientData.pastMeds}` : 'no past medication history'}, and {patientData.ongoingTherapies?.length > 0 ? `undergoing therapies like ${patientData.ongoingTherapies.join(', ').toLowerCase()}` : 'no ongoing therapies'}.
                    Regarding lifestyle, they are a {patientData.smokingStatus ? patientData.smokingStatus.toLowerCase() : 'unknown status'} smoker, exercise {patientData.exerciseFrequency ? patientData.exerciseFrequency.toLowerCase() : 'frequency not specified'}, sleep {patientData.sleepHours || 'N/A'} hours daily, follow a {patientData.dietType?.length > 0 ? patientData.dietType.join(', ').toLowerCase() : 'unspecified'} diet, and {patientData.alcoholConsumption ? patientData.alcoholConsumption.toLowerCase() : 'do not specify'} alcohol consumption.
                    The doctor notes {patientData.primarySymptoms ? `primary symptoms as ${patientData.primarySymptoms}` : 'no primary symptoms'}, an initial diagnosis of {patientData.initialDiagnosis || 'none'}, and {patientData.followUpRequired ? `requires a follow-up on ${formatDate(patientData.followUpDate)}` : 'no follow-up required'}.
                </p>
            </div>

            {/* Patient Demographics */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Patient Demographics</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Full Name:</strong> {patientData.name}</div>
                    <div className={styles.dataItem}><strong>Date of Birth:</strong> {formatDate(patientData.dob)}</div>
                    <div className={styles.dataItem}><strong>Gender:</strong> {patientData.gender}</div>
                    <div className={styles.dataItem}><strong>Blood Group:</strong> {patientData.bloodType}</div>
                    <div className={styles.dataItem}><strong>Phone Number:</strong> {patientData.phone}</div>
                    <div className={styles.dataItem}><strong>Emergency Contact:</strong> {patientData.emergencyName} ({patientData.emergencyPhone})</div>
                    <div className={styles.dataItem}><strong>Address:</strong> {patientData.address || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Occupation:</strong> {patientData.occupation || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Insurance Provider:</strong> {patientData.insuranceProvider || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Insurance Policy Number:</strong> {patientData.insurancePolicyNumber || 'N/A'}</div>
                    {patientData.insuranceFile && (
                        <div className={styles.dataItem}><strong>Insurance Document:</strong> <a href={`${baseUrl}${patientData.insuranceFile}`} target="_blank" rel="noopener noreferrer">View File</a></div>
                    )}
                </div>
            </div>

            {/* Blood Donation & Basic Vitals */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Blood Donation & Basic Vitals</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Last Donation Date:</strong> {formatDate(patientData.lastDonationDate)}</div>
                    <div className={styles.dataItem}><strong>Total Donations:</strong> {patientData.totalDonations}</div>
                    <div className={styles.dataItem}><strong>Eligible for Donation:</strong> {patientData.eligibleForDonation ? 'Yes' : 'No'}</div>
                    <div className={styles.dataItem}><strong>Blood Pressure:</strong> {patientData.bloodPressure || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Weight:</strong> {patientData.weight} kg</div>
                    <div className={styles.dataItem}><strong>Height:</strong> {patientData.height} cm</div>
                </div>
            </div>

            {/* Medical History */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Medical History</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Chronic Conditions:</strong> {patientData.chronicConditions?.length > 0 ? patientData.chronicConditions.join(', ') : 'None'}</div>
                    <div className={styles.dataItem}><strong>Previous Surgeries:</strong> {patientData.surgeries ? 'Yes' : 'No'}</div>
                    {patientData.surgeries && <div className={styles.dataItem}><strong>Surgery Details:</strong> {patientData.surgeryDetails || 'N/A'}</div>}
                    <div className={styles.dataItem}><strong>Medication Allergies:</strong> {patientData.medicationAllergies?.length > 0 ? patientData.medicationAllergies.join(', ') : 'None'}</div>
                    {patientData.medicationAllergies?.includes('Other') && <div className={styles.dataItem}><strong>Other Allergies:</strong> {patientData.otherAllergies || 'N/A'}</div>}
                    <div className={styles.dataItem}><strong>Family History:</strong> {patientData.familyHistory?.length > 0 ? patientData.familyHistory.join(', ') : 'None'}</div>
                    {patientData.familyHistory?.includes('Others') && <div className={styles.dataItem}><strong>Other Family History:</strong> {patientData.otherFamilyHistory || 'N/A'}</div>}
                </div>
            </div>

            {/* Medications & Treatment */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Medications & Treatment</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Current Medications:</strong> {patientData.currentMeds ? 'Yes' : 'No'}</div>
                    {patientData.currentMeds && <div className={styles.dataItem}><strong>Medications List:</strong> {patientData.medsList?.length > 0 ? patientData.medsList.join(', ') : 'N/A'}</div>}
                    <div className={styles.dataItem}><strong>Past Medications:</strong> {patientData.pastMeds || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Ongoing Therapies:</strong> {patientData.ongoingTherapies?.length > 0 ? patientData.ongoingTherapies.join(', ') : 'None'}</div>
                    {patientData.ongoingTherapies?.includes('Others') && <div className={styles.dataItem}><strong>Other Therapies:</strong> {patientData.ongoingTherapiesOthers || 'N/A'}</div>}
                </div>
            </div>

            {/* Lab & Imaging Reports */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Lab & Imaging Reports</h2>
                <div className={styles.profileGrid}>
                    {patientData.bloodReport && <div className={styles.dataItem}><strong>Blood Test Results:</strong> <a href={`${baseUrl}${patientData.bloodReport}`} target="_blank" rel="noopener noreferrer">View File</a></div>}
                    {patientData.imagingReport && <div className={styles.dataItem}><strong>Imaging Reports:</strong> <a href={`${baseUrl}${patientData.imagingReport}`} target="_blank" rel="noopener noreferrer">View File</a></div>}
                    <div className={styles.dataItem}><strong>Genetic/Biopsy Test:</strong> {patientData.geneticOrBiopsyTest ? 'Yes' : 'No'}</div>
                </div>
            </div>

            {/* Immunizations & Vaccinations */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Immunizations & Vaccinations</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Polio Vaccine:</strong> {patientData.polioVaccine ? 'Yes' : 'No'}</div>
                    <div className={styles.dataItem}><strong>Last Tetanus Shot:</strong> {formatDate(patientData.tetanusShot)}</div>
                    <div className={styles.dataItem}><strong>COVID-19 Vaccine:</strong> {patientData.covidVaccine || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>COVID Booster:</strong> {patientData.covidBooster ? 'Yes' : 'No'}</div>
                </div>
            </div>

            {/* Lifestyle & Nutrition */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Lifestyle & Nutrition</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Smoking Status:</strong> {patientData.smokingStatus || 'N/A'}</div>
                    {patientData.smokingStatus === 'Current' && <div className={styles.dataItem}><strong>Cigarettes per Day:</strong> {patientData.cigarettesPerDay || 'N/A'}</div>}
                    <div className={styles.dataItem}><strong>Exercise Frequency:</strong> {patientData.exerciseFrequency || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Sleep Hours:</strong> {patientData.sleepHours || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Diet Type:</strong> {patientData.dietType?.length > 0 ? patientData.dietType.join(', ') : 'N/A'}</div>
                    {patientData.dietType?.includes('Other') && <div className={styles.dataItem}><strong>Other Diet:</strong> {patientData.dietTypeOther || 'N/A'}</div>}
                    <div className={styles.dataItem}><strong>Alcohol Consumption:</strong> {patientData.alcoholConsumption || 'N/A'}</div>
                    {['Occasionally', 'Regularly'].includes(patientData.alcoholConsumption) && (
                        <div className={styles.dataItem}><strong>Alcohol Frequency:</strong> {patientData.alcoholFrequency || 'N/A'}</div>
                    )}
                </div>
            </div>

            {/* Doctor's Initial Observations */}
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Doctor's Initial Observations</h2>
                <div className={styles.profileGrid}>
                    <div className={styles.dataItem}><strong>Primary Symptoms:</strong> {patientData.primarySymptoms || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Initial Diagnosis:</strong> {patientData.initialDiagnosis || 'N/A'}</div>
                    <div className={styles.dataItem}><strong>Follow-Up Required:</strong> {patientData.followUpRequired ? 'Yes' : 'No'}</div>
                    {patientData.followUpRequired && <div className={styles.dataItem}><strong>Follow-Up Date:</strong> {formatDate(patientData.followUpDate)}</div>}
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;

