const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Validation middleware
const leadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('source').optional().isIn(['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'email_campaign', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost'])
];

const noteValidation = [
  body('content').trim().notEmpty().withMessage('Note content is required')
];

// @route   GET /api/leads
// @desc    Get all leads with filtering, sorting, and pagination
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (source) {
      filter.source = source;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email'),
      Lead.countDocuments(filter)
    ]);

    res.json({
      leads,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leads/stats
// @desc    Get lead statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const [statusStats, sourceStats, totalLeads, recentLeads] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Lead.countDocuments(),
      Lead.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Calculate conversion rate
    const convertedCount = statusStats.find(s => s._id === 'converted')?.count || 0;
    const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(2) : 0;

    // Transform stats to object format
    const statusCounts = {};
    statusStats.forEach(s => { statusCounts[s._id] = s.count; });
    
    const sourceCounts = {};
    sourceStats.forEach(s => { sourceCounts[s._id] = s.count; });

    res.json({
      total: totalLeads,
      recentLeads,
      conversionRate: parseFloat(conversionRate),
      byStatus: statusCounts,
      bySource: sourceCounts
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', leadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadData = {
      ...req.body,
      createdBy: req.user._id
    };

    const lead = await Lead.create(leadData);
    
    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedLead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', leadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update lead
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/leads/:id/status
// @desc    Update lead status
// @access  Private
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'contacted', 'qualified', 'converted', 'lost'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    lead.status = status;
    if (status === 'converted' && !lead.convertedAt) {
      lead.convertedAt = new Date();
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updatedLead);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add a note to a lead
// @access  Private
router.post('/:id/notes', noteValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const note = {
      content: req.body.content,
      createdBy: req.user._id
    };

    lead.notes.unshift(note);
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name email');

    res.status(201).json(updatedLead);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/leads/:id/notes/:noteId
// @desc    Delete a note from a lead
// @access  Private
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const noteIndex = lead.notes.findIndex(
      note => note._id.toString() === req.params.noteId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found' });
    }

    lead.notes.splice(noteIndex, 1);
    await lead.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/leads/public
// @desc    Create a lead from public contact form (no auth required)
// @access  Public
router.post('/public', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, company, message, source = 'website' } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      message,
      source,
      status: 'new'
    });

    res.status(201).json({ 
      message: 'Thank you for your inquiry! We will contact you soon.',
      leadId: lead._id 
    });
  } catch (error) {
    console.error('Public lead creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
