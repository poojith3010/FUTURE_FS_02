import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLead, updateLead } from '../services/leadService';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import './LeadForm.css';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    status: 'new',
    message: '',
    value: ''
  });

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const lead = await getLead(id);
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
        message: lead.message || '',
        value: lead.value || ''
      });
    } catch (error) {
      toast.error('Failed to fetch lead');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const leadData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : 0
      };
      
      await updateLead(id, leadData);
      toast.success('Lead updated successfully!');
      navigate(`/leads/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update lead';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="lead-form-page fade-in">
      <div className="form-header">
        <Link to={`/leads/${id}`} className="back-btn">
          <FiArrowLeft /> Back to Lead
        </Link>
        <h1>Edit Lead</h1>
        <p>Update lead information</p>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter lead name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                name="company"
                className="form-input"
                placeholder="Enter company name"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source</label>
              <select
                name="source"
                className="form-select"
                value={formData.source}
                onChange={handleChange}
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
                <option value="cold_call">Cold Call</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Value ($)</label>
              <input
                type="number"
                name="value"
                className="form-input"
                placeholder="0.00"
                value={formData.value}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Message / Notes</label>
            <textarea
              name="message"
              className="form-textarea"
              placeholder="Enter any initial message or notes about this lead..."
              value={formData.message}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="form-actions">
            <Link to={`/leads/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLead;
