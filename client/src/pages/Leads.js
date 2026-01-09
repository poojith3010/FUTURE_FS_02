import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getLeads, deleteLead, updateLeadStatus } from '../services/leadService';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit2, 
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiX
} from 'react-icons/fi';
import './Leads.css';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    source: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLeads(filters);
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      source: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      toast.success('Status updated successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(leadId);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasActiveFilters = filters.status || filters.source || filters.search;

  return (
    <div className="leads-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">
            Manage and track your leads ({pagination.total || 0} total)
          </p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          <FiPlus />
          Add Lead
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="card filter-card">
        <div className="search-bar">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, or company..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          <button 
            className={`btn btn-secondary filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Source</label>
              <select
                className="filter-select"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="advertisement">Advertisement</option>
                <option value="cold_call">Cold Call</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="filter-select"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({ ...filters, sortBy, sortOrder });
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="status-asc">Status</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button className="btn btn-secondary clear-filters" onClick={clearFilters}>
                <FiX /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : leads.length > 0 ? (
          <>
            <div className="table-container">
              <table className="table leads-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <div className="lead-cell">
                          <div className="lead-avatar-sm">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="lead-name">{lead.name}</span>
                            {lead.company && (
                              <span className="lead-company">{lead.company}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{lead.email}</td>
                      <td>
                        <span className="source-tag">
                          {lead.source.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${lead.status}`}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td>{formatDate(lead.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            to={`/leads/${lead._id}`} 
                            className="action-btn view"
                            title="View"
                          >
                            <FiEye />
                          </Link>
                          <Link 
                            to={`/leads/${lead._id}/edit`} 
                            className="action-btn edit"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </Link>
                          <button 
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(lead._id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.current === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  <FiChevronLeft /> Prev
                </button>
                <span className="pagination-info">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={pagination.current === pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No leads found</h3>
            <p>
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first lead.'}
            </p>
            {!hasActiveFilters && (
              <Link to="/leads/new" className="btn btn-primary">
                <FiPlus /> Add Lead
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
