import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLead, updateLeadStatus, addNote, deleteNote, deleteLead } from '../services/leadService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiBriefcase,
  FiCalendar,
  FiMessageSquare,
  FiSend,
  FiClock,
  FiUser
} from 'react-icons/fi';
import './LeadDetail.css';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const data = await getLead(id);
      setLead(data);
    } catch (error) {
      toast.error('Failed to fetch lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedLead = await updateLeadStatus(id, newStatus);
      setLead(updatedLead);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      const updatedLead = await addNote(id, noteContent);
      setLead(updatedLead);
      setNoteContent('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id, noteId);
        setLead({
          ...lead,
          notes: lead.notes.filter(n => n._id !== noteId)
        });
        toast.success('Note deleted');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleDeleteLead = async () => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        await deleteLead(id);
        toast.success('Lead deleted successfully');
        navigate('/leads');
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (date) => {
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

  if (!lead) {
    return null;
  }

  return (
    <div className="lead-detail fade-in">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/leads')}>
          <FiArrowLeft /> Back to Leads
        </button>
        <div className="header-actions">
          <Link to={`/leads/${id}/edit`} className="btn btn-secondary">
            <FiEdit2 /> Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDeleteLead}>
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Lead Info Card */}
        <div className="card lead-info-card">
          <div className="lead-profile">
            <div className="lead-avatar-lg">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div className="lead-title">
              <h1>{lead.name}</h1>
              {lead.company && (
                <span className="lead-company">
                  <FiBriefcase /> {lead.company}
                </span>
              )}
            </div>
          </div>

          <div className="lead-status-section">
            <label className="section-label">Status</label>
            <select
              className={`status-select-lg status-${lead.status}`}
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div className="lead-contact-info">
            <div className="contact-item">
              <FiMail className="contact-icon" />
              <div>
                <span className="contact-label">Email</span>
                <a href={`mailto:${lead.email}`} className="contact-value link">
                  {lead.email}
                </a>
              </div>
            </div>
            
            {lead.phone && (
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <div>
                  <span className="contact-label">Phone</span>
                  <a href={`tel:${lead.phone}`} className="contact-value link">
                    {lead.phone}
                  </a>
                </div>
              </div>
            )}
            
            <div className="contact-item">
              <FiCalendar className="contact-icon" />
              <div>
                <span className="contact-label">Source</span>
                <span className="contact-value capitalize">
                  {lead.source.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="contact-item">
              <FiClock className="contact-icon" />
              <div>
                <span className="contact-label">Created</span>
                <span className="contact-value">
                  {formatShortDate(lead.createdAt)}
                </span>
              </div>
            </div>

            {lead.convertedAt && (
              <div className="contact-item">
                <FiCalendar className="contact-icon converted" />
                <div>
                  <span className="contact-label">Converted</span>
                  <span className="contact-value">
                    {formatShortDate(lead.convertedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {lead.message && (
            <div className="lead-message">
              <h3 className="section-label">
                <FiMessageSquare /> Initial Message
              </h3>
              <p>{lead.message}</p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="card notes-card">
          <div className="card-header">
            <h2>Notes & Follow-ups</h2>
            <span className="note-count">{lead.notes?.length || 0} notes</span>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleAddNote} className="add-note-form">
              <textarea
                className="note-input"
                placeholder="Add a note or follow-up..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!noteContent.trim() || submittingNote}
              >
                {submittingNote ? 'Adding...' : (
                  <>
                    <FiSend /> Add Note
                  </>
                )}
              </button>
            </form>

            <div className="notes-list">
              {lead.notes && lead.notes.length > 0 ? (
                lead.notes.map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-header">
                      <div className="note-author">
                        <FiUser className="author-icon" />
                        <span>{note.createdBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="note-meta">
                        <span className="note-date">
                          {formatDate(note.createdAt)}
                        </span>
                        <button 
                          className="note-delete"
                          onClick={() => handleDeleteNote(note._id)}
                          title="Delete note"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <p className="note-content">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="empty-notes">
                  <FiMessageSquare className="empty-icon" />
                  <p>No notes yet. Add your first note above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
