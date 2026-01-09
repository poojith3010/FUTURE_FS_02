const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide lead name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'email_campaign', 'other'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new'
  },
  value: {
    type: Number,
    default: 0,
    min: [0, 'Value cannot be negative']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  notes: [noteSchema],
  followUpDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  convertedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for searching
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

// Update convertedAt when status changes to converted
leadSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'converted' && !this.convertedAt) {
    this.convertedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
