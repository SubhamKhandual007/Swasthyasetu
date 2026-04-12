import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import './ManageMedicines.css'; // Inline/Basic Admin CSS

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/medicines`);
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', stock: '', category: '', imageUrl: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/medicines/${editingId}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/medicines`, formData);
      }
      fetchMedicines();
      resetForm();
    } catch (err) {
      console.error('Error saving medicine:', err);
    }
  };

  const handleEdit = (med) => {
    setFormData({
      name: med.name,
      description: med.description,
      price: med.price,
      stock: med.stock,
      category: med.category,
      imageUrl: med.imageUrl || ''
    });
    setEditingId(med._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/medicines/${id}`);
        fetchMedicines();
      } catch (err) {
        console.error('Error deleting:', err);
      }
    }
  };

  if (loading) return <div className="admin-loading"><Loader2 className="spinner" size={40} /></div>;

  return (
    <div className="admin-manage-container">
      <div className="admin-header">
        <h1>Manage Medical Inventory</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New Medicine
        </button>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(med => (
              <tr key={med._id}>
                <td className="font-medium">{med.name}</td>
                <td>{med.category}</td>
                <td>{med.price}</td>
                <td>
                  <span className={`stock-badge ${med.stock > 10 ? 'good' : med.stock > 0 ? 'low' : 'out'}`}>
                    {med.stock}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="icon-btn edit" onClick={() => handleEdit(med)}>
                    <Edit size={16} />
                  </button>
                  <button className="icon-btn delete" onClick={() => handleDelete(med._id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group row">
                <div>
                  <label>Category</label>
                  <input required type="text" name="category" value={formData.category} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Price (₹)</label>
                  <input required type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Stock</label>
                  <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required rows="3" name="description" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label>Image URL (Optional)</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedicines;
