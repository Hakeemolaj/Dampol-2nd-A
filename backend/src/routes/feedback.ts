import express from 'express';
import { authenticate, restrictTo, optionalAuth } from '@/middleware/auth';

const router = express.Router();

// Mock feedback data
const feedbackData = [
  {
    id: '1',
    type: 'suggestion',
    category: 'Service Quality',
    subject: 'Improve document processing time',
    message: 'The document processing takes too long. Can we have a faster option?',
    rating: 4,
    status: 'under_review',
    submittedBy: {
      name: 'Juan Dela Cruz',
      email: 'juan@email.com',
      phone: '+63 912 345 6789'
    },
    submittedAt: '2024-12-15T10:30:00Z',
    respondedAt: null,
    response: null,
    assignedTo: 'admin@barangay.gov.ph',
    priority: 'medium',
    tags: ['documents', 'processing', 'efficiency']
  },
  {
    id: '2',
    type: 'complaint',
    category: 'Infrastructure',
    subject: 'Street light not working',
    message: 'The street light on Main Street has been broken for 2 weeks. It\'s getting dangerous at night.',
    rating: 2,
    status: 'resolved',
    submittedBy: {
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '+63 917 123 4567'
    },
    submittedAt: '2024-12-10T14:20:00Z',
    respondedAt: '2024-12-12T09:15:00Z',
    response: 'Thank you for reporting this. The street light has been repaired and is now working properly.',
    assignedTo: 'maintenance@barangay.gov.ph',
    priority: 'high',
    tags: ['infrastructure', 'lighting', 'safety']
  },
  {
    id: '3',
    type: 'inquiry',
    category: 'General Inquiry',
    subject: 'Barangay clearance requirements',
    message: 'What are the requirements for getting a barangay clearance? How long does it take?',
    rating: 5,
    status: 'resolved',
    submittedBy: {
      name: 'Pedro Garcia',
      email: 'pedro@email.com',
      phone: '+63 905 987 6543'
    },
    submittedAt: '2024-12-08T16:45:00Z',
    respondedAt: '2024-12-09T08:30:00Z',
    response: 'For barangay clearance, you need: valid ID, proof of residency, and ₱50 fee. Processing takes 3-5 business days.',
    assignedTo: 'documents@barangay.gov.ph',
    priority: 'low',
    tags: ['documents', 'clearance', 'requirements']
  }
];

// GET /api/v1/feedback - Get all feedback (admin only)
router.get('/', authenticate, restrictTo('admin'), (req, res) => {
  const { status, category, type, priority } = req.query;
  
  let filteredFeedback = [...feedbackData];
  
  if (status) {
    filteredFeedback = filteredFeedback.filter(f => f.status === status);
  }
  
  if (category) {
    filteredFeedback = filteredFeedback.filter(f => f.category === category);
  }
  
  if (type) {
    filteredFeedback = filteredFeedback.filter(f => f.type === type);
  }
  
  if (priority) {
    filteredFeedback = filteredFeedback.filter(f => f.priority === priority);
  }
  
  res.json({
    status: 'success',
    data: {
      feedback: filteredFeedback,
      summary: {
        total: feedbackData.length,
        pending: feedbackData.filter(f => f.status === 'pending').length,
        under_review: feedbackData.filter(f => f.status === 'under_review').length,
        resolved: feedbackData.filter(f => f.status === 'resolved').length,
        averageRating: feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
      }
    }
  });
});

// GET /api/v1/feedback/public - Get public feedback (for display)
router.get('/public', optionalAuth, (req, res) => {
  const publicFeedback = feedbackData
    .filter(f => f.status === 'resolved' && f.type !== 'complaint')
    .map(f => ({
      id: f.id,
      type: f.type,
      category: f.category,
      subject: f.subject,
      rating: f.rating,
      submittedAt: f.submittedAt,
      response: f.response,
      tags: f.tags
    }));
  
  res.json({
    status: 'success',
    data: publicFeedback
  });
});

// POST /api/v1/feedback - Submit new feedback
router.post('/', optionalAuth, (req, res) => {
  const {
    type,
    category,
    subject,
    message,
    rating,
    submitterName,
    submitterEmail,
    submitterPhone
  } = req.body;
  
  if (!type || !category || !subject || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Type, category, subject, and message are required'
    });
  }
  
  const newFeedback = {
    id: Date.now().toString(),
    type,
    category,
    subject,
    message,
    rating: rating || null,
    status: 'pending',
    submittedBy: {
      name: submitterName || 'Anonymous',
      email: submitterEmail || null,
      phone: submitterPhone || null
    },
    submittedAt: new Date().toISOString(),
    respondedAt: null,
    response: null,
    assignedTo: null,
    priority: 'medium',
    tags: []
  };
  
  feedbackData.push(newFeedback);
  
  res.status(201).json({
    status: 'success',
    message: 'Feedback submitted successfully',
    data: {
      id: newFeedback.id,
      submittedAt: newFeedback.submittedAt
    }
  });
});

// GET /api/v1/feedback/:id - Get specific feedback
router.get('/:id', authenticate, restrictTo('admin'), (req, res) => {
  const feedback = feedbackData.find(f => f.id === req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      status: 'error',
      message: 'Feedback not found'
    });
  }
  
  res.json({
    status: 'success',
    data: feedback
  });
});

// PUT /api/v1/feedback/:id - Update feedback (admin only)
router.put('/:id', authenticate, restrictTo('admin'), (req, res) => {
  const feedbackIndex = feedbackData.findIndex(f => f.id === req.params.id);
  
  if (feedbackIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Feedback not found'
    });
  }
  
  const { status, response, assignedTo, priority, tags } = req.body;
  
  if (status) feedbackData[feedbackIndex].status = status;
  if (response) {
    feedbackData[feedbackIndex].response = response;
    feedbackData[feedbackIndex].respondedAt = new Date().toISOString();
  }
  if (assignedTo) feedbackData[feedbackIndex].assignedTo = assignedTo;
  if (priority) feedbackData[feedbackIndex].priority = priority;
  if (tags) feedbackData[feedbackIndex].tags = tags;
  
  res.json({
    status: 'success',
    message: 'Feedback updated successfully',
    data: feedbackData[feedbackIndex]
  });
});

// GET /api/v1/feedback/stats/summary - Get feedback statistics
router.get('/stats/summary', authenticate, restrictTo('admin'), (req, res) => {
  const stats = {
    total: feedbackData.length,
    byStatus: {
      pending: feedbackData.filter(f => f.status === 'pending').length,
      under_review: feedbackData.filter(f => f.status === 'under_review').length,
      resolved: feedbackData.filter(f => f.status === 'resolved').length
    },
    byType: {
      suggestion: feedbackData.filter(f => f.type === 'suggestion').length,
      complaint: feedbackData.filter(f => f.type === 'complaint').length,
      inquiry: feedbackData.filter(f => f.type === 'inquiry').length
    },
    byCategory: feedbackData.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageRating: feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.length,
    averageResponseTime: 2.5 // days (mock data)
  };
  
  res.json({
    status: 'success',
    data: stats
  });
});

export default router;
