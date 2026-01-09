import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeadStats, getLeads } from '../services/leadService';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiUserCheck, 
  FiTrendingUp, 
  FiClock,
  FiArrowRight,
  FiPlus
} from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, leadsData] = await Promise.all([
        getLeadStats(),
        getLeads({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ]);
      setStats(statsData);
      setRecentLeads(leadsData.leads);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to your CRM dashboard</p>
        </div>
        <Link to="/leads/new" className="btn btn-primary">
          <FiPlus />
          Add Lead
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiUsers />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{stats?.total || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon new">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-label">New This Week</span>
            <span className="stat-value">{stats?.recentLeads || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon converted">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <span className="stat-label">Converted</span>
            <span className="stat-value">{stats?.byStatus?.converted || 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rate">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Conversion Rate</span>
            <span className="stat-value">{stats?.conversionRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Leads */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Leads</h2>
            <Link to="/leads" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="card-body">
            {recentLeads.length > 0 ? (
              <div className="recent-leads-list">
                {recentLeads.map((lead) => (
                  <Link 
                    to={`/leads/${lead._id}`} 
                    key={lead._id} 
                    className="recent-lead-item"
                  >
                    <div className="lead-avatar">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="lead-info">
                      <span className="lead-name">{lead.name}</span>
                      <span className="lead-email">{lead.email}</span>
                    </div>
                    <span className={`badge badge-${lead.status}`}>
                      {lead.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No leads yet. Start by adding your first lead!</p>
                <Link to="/leads/new" className="btn btn-primary btn-sm">
                  <FiPlus /> Add Lead
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Status Overview */}
        <div className="card">
          <div className="card-header">
            <h2>Lead Status Overview</h2>
          </div>
          <div className="card-body">
            <div className="status-list">
              <div className="status-item">
                <span className="status-dot new"></span>
                <span className="status-name">New</span>
                <span className="status-count">{stats?.byStatus?.new || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot contacted"></span>
                <span className="status-name">Contacted</span>
                <span className="status-count">{stats?.byStatus?.contacted || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot qualified"></span>
                <span className="status-name">Qualified</span>
                <span className="status-count">{stats?.byStatus?.qualified || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot converted"></span>
                <span className="status-name">Converted</span>
                <span className="status-count">{stats?.byStatus?.converted || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-dot lost"></span>
                <span className="status-name">Lost</span>
                <span className="status-count">{stats?.byStatus?.lost || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="card">
          <div className="card-header">
            <h2>Lead Sources</h2>
          </div>
          <div className="card-body">
            {stats?.bySource && Object.keys(stats.bySource).length > 0 ? (
              <div className="source-list">
                {Object.entries(stats.bySource).map(([source, count]) => (
                  <div key={source} className="source-item">
                    <span className="source-name">
                      {source.replace('_', ' ')}
                    </span>
                    <div className="source-bar-container">
                      <div 
                        className="source-bar"
                        style={{ 
                          width: `${(count / stats.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="source-count">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No source data available yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
