import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
const { Suspense, lazy } = React;

const ChatBot = lazy(() => import('./Chat/Chatbot'));
const Chat = lazy(() => import('./Chat/SuuSri/SuuSri'));
const AdminDashboard = lazy(() => import('./AdminDashboard/AdminDashboard'));
const AdminLogin = lazy(() => import('./AdminDashboard/AdminLogin'));
const AdminAuthOptions = lazy(() => import('./AdminDashboard/AdminAuthOptions'));
const AdminRegister = lazy(() => import('./AdminDashboard/AdminRegister'));
const DoctorsData = lazy(() => import('./DoctorsData/DoctorsData'));
const Accidents = lazy(() => import('./Doctorspecificscreen/Accidents'));
const DrBloodDonation = lazy(() => import('./Doctorspecificscreen/BloodDonation'));
const DrBloodrequests = lazy(() => import('./Doctorspecificscreen/DrBloodRequests'));
const AccidentDetection = lazy(() => import('./Features/AccidentDetection'));
const BloodDonation = lazy(() => import('./Features/BloodDonation'));
const FetchDonors = lazy(() => import("./Features/FetchDonors"));
const FetchRequest = lazy(() => import('./Features/Fetchrequest'));
const MedicineStore = lazy(() => import('./Map/MedicineStore'));
const Home = lazy(() => import('./Mobile/Home'));
const NavBar = lazy(() => import('./Mobile/NavBar'));
const AccidentAlert = lazy(() => import('./Mobile/pages/Accident/AccidentAlert'));
const Ambulance = lazy(() => import('./Mobile/pages/Ambulance/Ambulance'));
const BloodDonateReceive = lazy(() => import('./Mobile/pages/BloodDonateReceive/BloodDonateReceive'));
const AllLabs = lazy(() => import('./Mobile/pages/BloodTest/AllLabs'));
const BloodTest = lazy(() => import('./Mobile/pages/BloodTest/BloodTest'));
const CheckReport = lazy(() => import('./Mobile/pages/BloodTest/CheckReport'));
const DownloadReport = lazy(() => import('./Mobile/pages/BloodTest/DownloadReport'));
const FollowUp = lazy(() => import('./Mobile/pages/BloodTest/FollowUp'));
const TrackOrder = lazy(() => import('./Mobile/pages/BloodTest/TrackOrder'));
const Nutrition = lazy(() => import('./Mobile/pages/DietChart/Nutrition'));
const Doctors = lazy(() => import('./Mobile/pages/Doctors/Doctors'));
const EHRHealthData = lazy(() => import('./Mobile/pages/EHRData/EHRHealthData'));
const NotFound = lazy(() => import('./Mobile/pages/Error/404'));
const AllHospitals = lazy(() => import('./Mobile/pages/Hospitals/AllHospitals'));
// const AppointmentDetails = lazy(() => import('./Mobile/pages/Hospitals/AppointmentDetails'));
const VideoCall = lazy(() => import('./Features/VideoConsultation'));
const Billing = lazy(() => import('./Mobile/pages/Hospitals/Billing'));
const EmergencyServices = lazy(() => import('./Mobile/pages/Hospitals/EmergencyServices'));
const HospitalDashboard = lazy(() => import('./Mobile/pages/Hospitals/Hospital'));
const MedicalRecords = lazy(() => import('./Mobile/pages/Hospitals/MedicalRecords'));
const AllMedicineStore = lazy(() => import('./Mobile/pages/MedicineStore/AllMedicineStore'));
const Medicine = lazy(() => import('./Mobile/pages/MedicineStore/Medicine'));
const MedicineAll = lazy(() => import('./Mobile/pages/MedicineStore/MedicineAll'));
const MedicineStorePage = lazy(() => import('./Medicines/MedicineStore'));
const CartPage = lazy(() => import('./Medicines/CartPage'));
const Checkout = lazy(() => import('./Medicines/Checkout'));
const OrderConfirmation = lazy(() => import('./Medicines/OrderConfirmation'));
const OrderHistory = lazy(() => import('./Medicines/OrderHistory'));
const ManageMedicines = lazy(() => import('./AdminDashboard/ManageMedicines'));
const Profile = lazy(() => import('./Mobile/pages/Profile/Profile'));
const Notifications = lazy(() => import('./Mobile/pages/Notifications/Notifications'));
const Welcome = lazy(() => import('./Mobile/Welcome'));
const PatientsData = lazy(() => import('./Patientdata/PatientsData'));
const PatientProfile = lazy(() => import('./PatientProfile/PatientProfile'));
const Doctorheader = lazy(() => import('./RegisterasDoctor/Doctorheader'));
const DoctorLogin = lazy(() => import('./RegisterasDoctor/DoctorLogin'));
const DoctorRegister = lazy(() => import('./RegisterasDoctor/DoctorRegister'));
const Login = lazy(() => import('./RegisterasUser/Login'));
const Register = lazy(() => import('./RegisterasUser/Register'));
const RoleSelection = lazy(() => import('./RegisterasUser/RoleSelection'));
const Authpage = lazy(() => import('./Screens/Authpage'));
const Dashboard = lazy(() => import('./Screens/Dashboard'));
const Doctorpage = lazy(() => import('./Screens/Doctorpage'));
const Header = lazy(() => import('./Screens/Header'));
const AppointmentDetails = lazy(() => import('./Mobile/pages/Hospitals/AppointmentDetails'));
const NutritionistDietPlan = lazy(() => import('./Mobile/pages/Nutritionists/NutritionistDietPlan'));
const NutritionistAppointments = lazy(() => import('./Mobile/pages/Nutritionists/NutritionistAppointments'));
const EHRManagement = lazy(() => import('./AdminDashboard/EHRManagement'));
const MedicalHistory = lazy(() => import('./Mobile/pages/EHRData/MedicineHistory'));
const PublicTracker = lazy(() => import('./Public/PublicTracker'));

function RoutesOfThePage() {
    return (
        <Router>
            <div className="App">
                <Suspense fallback={
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                }>
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
                </Suspense>
            </div>
        </Router>
    );
}

export default RoutesOfThePage;
