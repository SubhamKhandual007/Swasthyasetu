import API_BASE_URL from '../../apiConfig';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RoleSelection() {
  const [userType, setUserType] = useState('donor');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userType }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local storage user data if exists
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        localUser.userType = data.userType;
        localStorage.setItem('user', JSON.stringify(localUser));

        toast.success('Role updated successfully!');
        navigate('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-sm-8 col-12">
          <div className="card shadow-lg p-4 text-center">
            <h2 className="mb-4" style={{ color: '#1b558b' }}>Complete Your Profile</h2>
            <p className="text-muted mb-4">Please select your role to continue</p>
            
            <form onSubmit={handleUpdateRole}>
              <div className="form-group mb-4">
                <label className="form-label text-primary">Select Your Role</label>
                <select 
                  className="form-select"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  style={{ borderRadius: '10px' }}
                >
                  <option value="donor">Donor</option>
                  <option value="recipient">Recipient</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={loading}
                style={{ backgroundColor: '#1b558b', borderRadius: '10px', padding: '12px' }}
              >
                {loading ? 'Updating...' : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default RoleSelection;
