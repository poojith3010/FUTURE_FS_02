import api from './api';

// Get all leads with filters
export const getLeads = async (params = {}) => {
  const response = await api.get('/leads', { params });
  return response.data;
};

// Get lead statistics
export const getLeadStats = async () => {
  const response = await api.get('/leads/stats');
  return response.data;
};

// Get single lead
export const getLead = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

// Create new lead
export const createLead = async (leadData) => {
  const response = await api.post('/leads', leadData);
  return response.data;
};

// Update lead
export const updateLead = async (id, leadData) => {
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

// Update lead status
export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/leads/${id}/status`, { status });
  return response.data;
};

// Delete lead
export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

// Add note to lead
export const addNote = async (leadId, content) => {
  const response = await api.post(`/leads/${leadId}/notes`, { content });
  return response.data;
};

// Delete note from lead
export const deleteNote = async (leadId, noteId) => {
  const response = await api.delete(`/leads/${leadId}/notes/${noteId}`);
  return response.data;
};
