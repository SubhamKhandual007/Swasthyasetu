import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ChatBot from './Chat/Chatbot';
import Chat from './Chat/SuuSri/SuuSri';
import AdminDashboard from './AdminDashboard/AdminDashboard';
import AdminLogin from './AdminDashboard/AdminLogin';
import AdminAuthOptions from './AdminDashboard/AdminAuthOptions';
import AdminRegister from './AdminDashboard/AdminRegister';
import DoctorsData from './DoctorsData/DoctorsData';
import Accidents from './Doctorspecificscreen/Accidents';
import DrBloodDonation from './Doctorspecificscreen/BloodDonation';
import DrBloodrequests from './Doctorspecificscreen/DrBloodRequests';
import AccidentDetection from './Features/AccidentDetection';
import BloodDonation from './Features/BloodDonation';
import FetchDonors from "./Features/FetchDonors";
import FetchRequest from './Features/Fetchrequest';
import MedicineStore from './Map/MedicineStore';
import Home from './Mobile/Home';
import NavBar from './Mobile/NavBar';
import AccidentAlert from './Mobile/pages/Accident/AccidentAlert';
import Ambulance from './Mobile/pages/Ambulance/Ambulance';
import BloodDonateReceive from './Mobile/pages/BloodDonateReceive/BloodDonateReceive';
import AllLabs from './Mobile/pages/BloodTest/AllLabs';
import BloodTest from './Mobile/pages/BloodTest/BloodTest';
import CheckReport from './Mobile/pages/BloodTest/CheckReport';
import DownloadReport from './Mobile/pages/BloodTest/DownloadReport';
import FollowUp from './Mobile/pages/BloodTest/FollowUp';
import TrackOrder from './Mobile/pages/BloodTest/TrackOrder';
import Nutrition from './Mobile/pages/DietChart/Nutrition';
import Doctors from './Mobile/pages/Doctors/Doctors';
import EHRHealthData from './Mobile/pages/EHRData/EHRHealthData';
import NotFound from './Mobile/pages/Error/404';
import AllHospitals from './Mobile/pages/Hospitals/AllHospitals';
// import AppointmentDetails from './Mobile/pages/Hospitals/AppointmentDetails';
import VideoCall from './Features/VideoConsultation';
import Billing from './Mobile/pages/Hospitals/Billing';
import EmergencyServices from './Mobile/pages/Hospitals/EmergencyServices';
import HospitalDashboard from './Mobile/pages/Hospitals/Hospital';
import MedicalRecords from './Mobile/pages/Hospitals/MedicalRecords';
import AllMedicineStore from './Mobile/pages/MedicineStore/AllMedicineStore';
import Medicine from './Mobile/pages/MedicineStore/Medicine';
import MedicineAll from './Mobile/pages/MedicineStore/MedicineAll';
import MedicineStorePage from './Medicines/MedicineStore';
import CartPage from './Medicines/CartPage';
import Checkout from './Medicines/Checkout';
import OrderConfirmation from './Medicines/OrderConfirmation';
import OrderHistory from './Medicines/OrderHistory';
import ManageMedicines from './AdminDashboard/ManageMedicines';
import Profile from './Mobile/pages/Profile/Profile';
import Notifications from './Mobile/pages/Notifications/Notifications';
import Welcome from './Mobile/Welcome';
import PatientsData from './Patientdata/PatientsData';
import PatientProfile from './PatientProfile/PatientProfile';
import Doctorheader from './RegisterasDoctor/Doctorheader';
import DoctorLogin from './RegisterasDoctor/DoctorLogin';
import DoctorRegister from './RegisterasDoctor/DoctorRegister';
import Login from './RegisterasUser/Login';
import Register from './RegisterasUser/Register';
import RoleSelection from './RegisterasUser/RoleSelection';
import Authpage from './Screens/Authpage';
import Dashboard from './Screens/Dashboard';
import Doctorpage from './Screens/Doctorpage';
import Header from './Screens/Header';
import AppointmentDetails from './Mobile/pages/Hospitals/AppointmentDetails';
import NutritionistDietPlan from './Mobile/pages/Nutritionists/NutritionistDietPlan';
import NutritionistAppointments from './Mobile/pages/Nutritionists/NutritionistAppointments';
import EHRManagement from './AdminDashboard/EHRManagement';
import MedicalHistory from './Mobile/pages/EHRData/MedicineHistory';
import PublicTracker from './Public/PublicTracker';

function RoutesOfThePage() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Home and common header */}
                    <Route path='/Landingpage' element={<><Header /><Dashboard /></>} />
                    <Route path='/' element={<><Header /><Authpage /></>} />

                    {/* Auth routes */}
                    <Route path="/login-as-user" element={<><Header /><Login /></>} />
                    <Route path="/register-as-user" element={<><Header /><Register /></>} />
                    <Route path="/select-role" element={<><Header /><RoleSelection /></>} />
                    <Route path="/login-as-doctor" element={<><Header /><DoctorLogin /></>} />
                    <Route path="/register-as-doctor" element={<><Header /><DoctorRegister /></>} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/login-as-admin" element={<><Header /><AdminLogin /></>} />
                    <Route path="/admin-auth-options" element={<><Header /><AdminAuthOptions /></>} />
                    <Route path="/register-as-admin" element={<><Header /><AdminRegister /></>} />

                    {/* User routes */}
                    <Route path="/dashboard" element={<><Header /><Dashboard /></>} />
                    <Route path="/blood-donation" element={<><BloodDonateReceive /><NavBar /></>} />
                    <Route path="/blood-donation-check" element={<><Header /><FetchDonors />    </>} />

                    <Route path="/accident-detection" element={<><Header /><AccidentDetection /></>} />
                    <Route path='/blood-request-check' element={<><Header /><FetchRequest /></>} />

                    {/* MAP */}
                    <Route path="/map" element={<><Header /><MedicineStore /></>} />

                    {/* Doctor page routes */}
                    <Route path='/blood-donations-dr-page' element={<><Doctorheader /><DrBloodDonation /></>} />
                    <Route path='/blood-requests-dr-page' element={<><Doctorheader /><DrBloodrequests /></>} />
                    <Route path='/accident-dr-page' element={<><Doctorheader /><Accidents /></>} />

                    {/* {Patient Data} */}
                    <Route path='/PatientsData' element={<><Header /><PatientsData /></>} />
                    <Route path='/Patient' element={<><Header /><PatientProfile patientId="67c35f1c8b405ef1defec414" /></>} />
                    {/* Doctor page with its specific header */}
                    <Route
                        path='/doctor-screen'
                        element={
                            <>
                                <Doctorheader /> {/* Render the DoctorHeader only for the doctor page */}
                                <div className="container mt-4">
                                    <Doctorpage />
                                </div>
                            </>
                        }
                    />

                    {/* {Patient Data} */}
                    <Route path='/DoctorsData' element={<><Doctorheader /><DoctorsData /></>} />
                    <Route path='/Doctor' element={<><Doctorheader /><PatientProfile patientId="67c35f1c8b405ef1defec414" /></>} />

                    {/* 404 page */}
                    <Route path='*' element={<NotFound />} />

                    {/* Mobile Routes */}
                    <Route path='/Welcome' element={<><Welcome /></>} />
                    <Route path='/home' element={<><Home /><NavBar /></>} />
                    <Route path='/profile' element={<><Profile /><NavBar /></>} />
                    <Route path='/blood-donate-receive' element={<><BloodDonateReceive /><NavBar /></>} />
                    <Route path='/accident-alert' element={<><AccidentAlert /><NavBar /></>} />
                    <Route path='/blood-test' element={<><BloodTest /><NavBar /></>} />
                    <Route path="/all-labs" element={<><AllLabs /><NavBar /></>} />
                    <Route path='/medicine' element={<><Medicine /><Navbar /></>} />
                    <Route path='/medicine-stores' element={<><AllMedicineStore /><NavBar /></>} />
                    <Route path='/medicine-all' element={<><MedicineAll /><NavBar /></>} />
                    <Route path='/medicine-history' element={<><MedicalHistory /><NavBar /></>} />
                    <Route path='/medicines' element={<><Header /><MedicineStorePage /></>} />
                    <Route path='/cart' element={<><Header /><CartPage /></>} />
                    <Route path='/checkout' element={<><Header /><Checkout /></>} />
                    <Route path='/order-confirmation/:id' element={<><Header /><OrderConfirmation /></>} />
                    <Route path='/order-history' element={<><Header /><OrderHistory /></>} />
                    <Route path='/admin/medicines' element={<><Header /><ManageMedicines /></>} />
                    <Route path='/ehr-management' element={<><Header /><EHRManagement /></>} />
                    <Route path="/doctors" element={<Doctors />} />

                    <Route path="/check-report" element={<><CheckReport /><NavBar /></>} />
                    <Route path="/download-report" element={<><DownloadReport /><NavBar /></>} />
                    <Route path="/follow-up" element={<><FollowUp /><NavBar /></>} />
                    <Route path="/track-order" element={<><TrackOrder /></>} />
                    <Route path="/nutrition" element={<><Nutrition /><NavBar /></>} />
                    <Route path="/EHRHealthData" element={<><EHRHealthData patientId="67ccc44c671f5aa635f458e1" /><NavBar /></>} />
                    <Route path='/ambulance' element={<><Ambulance /><NavBar /></>} />
                    <Route path='/suusri' element={<><Chat /></>} />
                    <Route path='/hospitals' element={<><HospitalDashboard /><NavBar /></>} />
                    <Route path="/all-hospitals" element={<><AllHospitals /><NavBar /></>} />
                    <Route
                      path="/medical-records"
                      element={<><EHRManagement /></>}
                    />
                    <Route path="/emergency-services" element={<><EmergencyServices /><NavBar /></>} />
                    <Route path="/billing" element={<><Billing /><NavBar /></>} />
                    <Route path="/appointment/:bookingId" element={<AppointmentDetails />} />
                    <Route path="/nutritionists" element={<><NutritionistDietPlan /><NavBar /></>} />
                    <Route path="/nutritionist-appointments" element={<><NutritionistAppointments /><NavBar /></>} />
                    {/* devio call routes */}
                    <Route path='/vedio-calling' element={<VideoCall />} />
                    <Route path='/notifications' element={<Notifications />} />
                    <Route path='/track/:token' element={<PublicTracker />} />
                </Routes>
            </div>
        </Router>
    );
}

export default RoutesOfThePage;
