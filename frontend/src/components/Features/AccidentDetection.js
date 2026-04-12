import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AccidentDetection() {
  const [accidents, setAccidents] = useState([]);
  const [newAccident, setNewAccident] = useState({ location: '', description: '', city: '', state: '' });
  const [locationOptions] = useState([
    // Bhubaneswar locations
    { value: 'Jaydev Vihar', label: 'Jaydev Vihar' },
    { value: 'Patia', label: 'Patia' },
    { value: 'Chandrasekharpur', label: 'Chandrasekharpur' },
    { value: 'Sahid Nagar', label: 'Sahid Nagar' },
    { value: 'Unit 1', label: 'Unit 1' },
    { value: 'Unit 2', label: 'Unit 2' },
    { value: 'Unit 3', label: 'Unit 3' },
    { value: 'Old Town', label: 'Old Town' },
    { value: 'Bapuji Nagar', label: 'Bapuji Nagar' },
    { value: 'Nayapalli', label: 'Nayapalli' },
    { value: 'Rasulgarh', label: 'Rasulgarh' },
    { value: 'Baramunda', label: 'Baramunda' },
    { value: 'Khandagiri', label: 'Khandagiri' },
    { value: 'Airport Road', label: 'Airport Road' },
    { value: 'Saheed Nagar', label: 'Saheed Nagar' },
    { value: 'Vani Vihar', label: 'Vani Vihar' },
    { value: 'Kalpana Square', label: 'Kalpana Square' },
  
    // Cuttack locations
    { value: 'Buxi Bazar', label: 'Buxi Bazar' },
    { value: 'College Square', label: 'College Square' },
    { value: 'Badambadi', label: 'Badambadi' },
    { value: 'Choudhury Bazar', label: 'Choudhury Bazar' },
    { value: 'Madhupatna', label: 'Madhupatna' },
    { value: 'Chauliaganj', label: 'Chauliaganj' },
    { value: 'Nuapada', label: 'Nuapada' },
    { value: 'Jagatpur', label: 'Jagatpur' },
    { value: 'Bidanasi', label: 'Bidanasi' },
    { value: 'Markat Nagar', label: 'Markat Nagar' },
    { value: 'Tulsipur', label: 'Tulsipur' },
    { value: 'Khan Nagar', label: 'Khan Nagar' },
    { value: 'Ranihat', label: 'Ranihat' },
    { value: 'Jobra', label: 'Jobra' },
    { value: 'Salepur', label: 'Salepur' },
    { value: 'Niali', label: 'Niali' },
    { value: 'Naraj', label: 'Naraj' },
    { value: 'Barang', label: 'Barang' },
    { value: 'Choudwar', label: 'Choudwar' },
  
    // Jajpur locations
    { value: 'Jajpur Town', label: 'Jajpur Town' },
    { value: 'Chhatia', label: 'Chhatia' },
    { value: 'Binjharpur', label: 'Binjharpur' },
    { value: 'Bari', label: 'Bari' },
    { value: 'Korai', label: 'Korai' },
    { value: 'Dasarathpur', label: 'Dasarathpur' },
    { value: 'Sukinda', label: 'Sukinda' },
    { value: 'Kalinganagar', label: 'Kalinganagar' },
    { value: 'Jajpur Road', label: 'Jajpur Road' },
    { value: 'Vyasanagar', label: 'Vyasanagar' },
    { value: 'Chandikhol', label: 'Chandikhol' },
  
    // Puri locations
    { value: 'Grand Road', label: 'Grand Road' },
    { value: 'Chakratirtha Road', label: 'Chakratirtha Road' },
    { value: 'Sea Beach Road', label: 'Sea Beach Road' },
    { value: 'Swargadwar', label: 'Swargadwar' },
    { value: 'Baliapanda', label: 'Baliapanda' },
    { value: 'Satyabadi', label: 'Satyabadi' },
    { value: 'Konark', label: 'Konark' },
    { value: 'Nimapada', label: 'Nimapada' },
    { value: 'Pipili', label: 'Pipili' },
    { value: 'Chandanpur', label: 'Chandanpur' },
    { value: 'Delang', label: 'Delang' },
  
    // Bhadrak locations
    { value: 'Bhadrak Town', label: 'Bhadrak Town' },
    { value: 'Dhamnagar', label: 'Dhamnagar' },
    { value: 'Basudevpur', label: 'Basudevpur' },
    { value: 'Chandabali', label: 'Chandabali' },
    { value: 'Bont', label: 'Bont' },
    { value: 'Tihidi', label: 'Tihidi' },
    { value: 'Aradi', label: 'Aradi' },
    { value: 'Dobal', label: 'Dobal' },
    { value: 'Nalagohira', label: 'Nalagohira' },
    { value: 'Bhandaripokhari', label: 'Bhandaripokhari' },
    { value: 'Dhamra Port', label: 'Dhamra Port' },
    { value: 'Jagannathpur', label: 'Jagannathpur' },
  ]);
  

  const [cityOptions] = useState([
    { value: 'Agra', label: 'Agra' },
    { value: 'Ahmedabad', label: 'Ahmedabad' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Bhopal', label: 'Bhopal' },
    { value: 'Bhubaneswar', label: 'Bhubaneswar' },
    { value: 'Chandigarh', label: 'Chandigarh' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Cuttack', label: 'Cuttack' },
    { value: 'Dehradun', label: 'Dehradun' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Gandhinagar', label: 'Gandhinagar' },
    { value: 'Gangtok', label: 'Gangtok' },
    { value: 'Guwahati', label: 'Guwahati' },
    { value: 'Hyderabad', label: 'Hyderabad' },
    { value: 'Imphal', label: 'Imphal' },
    { value: 'Indore', label: 'Indore' },
    { value: 'Itanagar', label: 'Itanagar' },
    { value: 'Jaipur', label: 'Jaipur' },
    { value: 'Jajpur-Town', label: 'Jajpur-Town' },
    {value: 'Jajpur-Road', label: 'Jajpur-Road' },
    { value: 'Jammu', label: 'Jammu' },
    { value: 'Jodhpur', label: 'Jodhpur' },
    { value: 'Kanpur', label: 'Kanpur' },
    { value: 'Kochi', label: 'Kochi' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Lucknow', label: 'Lucknow' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Nagpur', label: 'Nagpur' },
    { value: 'Panaji', label: 'Panaji' },
    { value: 'Patna', label: 'Patna' },
    { value: 'Puducherry', label: 'Puducherry' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Puri', label: 'Puri' },
    { value: 'Raipur', label: 'Raipur' },
    { value: 'Ranchi', label: 'Ranchi' },
    { value: 'Shimla', label: 'Shimla' },
    { value: 'Srinagar', label: 'Srinagar' },
    { value: 'Surat', label: 'Surat' },
    { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
    { value: 'Varanasi', label: 'Varanasi' },
    { value: 'Visakhapatnam', label: 'Visakhapatnam' }
  ]);
  

  const [stateOptions] = useState([
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Manipur', label: 'Manipur' },
    { value: 'Meghalaya', label: 'Meghalaya' },
    { value: 'Mizoram', label: 'Mizoram' },
    { value: 'Nagaland', label: 'Nagaland' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Sikkim', label: 'Sikkim' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Tripura', label: 'Tripura' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'West Bengal', label: 'West Bengal' }
  ]);
  

  // Fetch accidents data from the backend
  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/accident/accidents`);
        if (response.ok) {
          const data = await response.json();
          setAccidents(data.accidents || []);
        } else {
          toast.error('Failed to fetch accidents. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching accidents:', error);
        toast.error('Error fetching accidents. Please try again later.');
      }
    };

    fetchAccidents();
  }, []);

  // Handle the submission of a new accident
  const handleNewAccident = async (e) => {
    e.preventDefault();

    if (!newAccident.location || !newAccident.description || !newAccident.city || !newAccident.state) {
      toast.error('Location, description, city, and state are required!');
      return;
    }

    const accidentData = {
      location: newAccident.location,
      description: newAccident.description,
      city: newAccident.city,
      state: newAccident.state,
      status: 'Pending', // Default status is Pending
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/accident/accidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accidentData),
      });

      if (response.ok) {
        const newAccidentData = await response.json();
        setAccidents([...accidents, newAccidentData]);
        setNewAccident({ location: '', description: '', city: '', state: '' });
        toast.success('Accident reported successfully!');
      } else {
        const errorText = await response.text();
        toast.error(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error reporting the accident:', error);
      toast.error('Error reporting the accident. Please try again.');
    }
  };

  // Convert time to IST
  const convertToIST = (time) => {
    const date = new Date(time);
    const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleString('en-IN', options);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: '#1b558b' }}>Accident Alert</h2>
      <div className="row">
        {/* Left Section: Scrollable List */}
        <div className="col-md-6 mb-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <div className="card shadow-lg border-0 rounded-3 card-animate">
            <div className="card-body">
              <h3 className="card-title" style={{ color: '#1b558b' }}>Recent Accidents</h3>
              <ul className="list-group list-group-flush">
                {accidents.length > 0 ? (
                  accidents.map((accident) => (
                    <li key={accident._id} className="list-group-item bg-light rounded-3 shadow-sm mb-3">
                      <strong style={{ color: '#1b558b' }}>{accident.location}, {accident.city}, {accident.state}</strong>
                      <br />
                      {accident.description}
                      <br />
                      <small className="text-muted">{convertToIST(accident.time)}</small>
                      <div className="mt-3">
                        {/* Display status */}
                        <span className={`badge ${accident.status === 'Pending' ? 'bg-warning' : 'bg-success'}`}>
                          {accident.status}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center">No accidents reported yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-lg border-0 rounded-3 card-animate">
            <div className="card-body">
              <h3 className="card-title" style={{ color: '#1b558b' }}>Report New Accident</h3>
              <form onSubmit={handleNewAccident}>
                <div className="form-group mb-3">
                  <label htmlFor="accidentLocation" className="form-label" style={{ color: '#1b558b' }}>Location</label>
                  <Select
                    id="accidentLocation"
                    options={locationOptions}
                    value={locationOptions.find((option) => option.value === newAccident.location) || { value: newAccident.location, label: newAccident.location }}
                    onChange={(selectedOption) =>
                      setNewAccident({ ...newAccident, location: selectedOption ? selectedOption.value : '' })
                    }
                    placeholder="Select a location"
                    isClearable
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="accidentCity" className="form-label" style={{ color: '#1b558b' }}>City</label>
                  <Select
                    id="accidentCity"
                    options={cityOptions}
                    value={cityOptions.find((option) => option.value === newAccident.city) || { value: newAccident.city, label: newAccident.city }}
                    onChange={(selectedOption) =>
                      setNewAccident({ ...newAccident, city: selectedOption ? selectedOption.value : '' })
                    }
                    placeholder="Select a city"
                    isClearable
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="accidentState" className="form-label" style={{ color: '#1b558b' }}>State</label>
                  <Select
                    id="accidentState"
                    options={stateOptions}
                    value={stateOptions.find((option) => option.value === newAccident.state) || { value: newAccident.state, label: newAccident.state }}
                    onChange={(selectedOption) =>
                      setNewAccident({ ...newAccident, state: selectedOption ? selectedOption.value : '' })
                    }
                    placeholder="Select a state"
                    isClearable
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="accidentDescription" className="form-label" style={{ color: '#1b558b' }}>Description</label>
                  <textarea
                    className="form-control"
                    id="accidentDescription"
                    value={newAccident.description}
                    onChange={(e) => setNewAccident({ ...newAccident, description: e.target.value })}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn" style={{ backgroundColor: '#1b558b', color: 'white', width: '100%', padding: '10px' }}>Report Accident</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AccidentDetection;
