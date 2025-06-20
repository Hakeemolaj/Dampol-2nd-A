const express = require('express');
const router = express.Router();

// Sample announcements data
const announcements = [
  {
    id: '1',
    title: 'Barangay Assembly - January 15, 2025',
    summary: 'Monthly barangay assembly for Dampol 2nd A residents to discuss community matters',
    content: 'Join us for our monthly community meeting at the Dampol 2nd A Barangay Hall. We will discuss important matters affecting our community including upcoming infrastructure projects, community programs, and budget allocations for the next quarter. All residents are encouraged to attend.',
    category: 'Meeting',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2025-01-10T08:00:00Z',
    expiresAt: '2025-01-15T18:00:00Z',
    createdAt: '2025-01-10T08:00:00Z',
    author: 'Barangay Captain Dampol 2nd A',
  },
  {
    id: '2',
    title: 'Free Medical Mission - January 20, 2025',
    summary: 'Health program available for all Dampol 2nd A residents',
    content: 'We are pleased to announce a free medical mission for all Dampol 2nd A residents. This program includes basic health screening, blood pressure monitoring, consultation with licensed medical professionals, and free medicines. Venue: Dampol 2nd A Barangay Hall.',
    category: 'Health',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2025-01-12T09:00:00Z',
    expiresAt: '2025-01-20T17:00:00Z',
    createdAt: '2025-01-12T09:00:00Z',
    author: 'Barangay Health Committee',
  },
  {
    id: '3',
    title: 'Road Improvement Project - Dampol Road',
    summary: 'Road concreting project ongoing, expect traffic delays',
    content: 'Please be advised that road improvement work is currently ongoing on Dampol Road from 7:00 AM to 5:00 PM daily. The project includes road concreting and drainage improvement. Residents are advised to use alternative routes and expect minor traffic delays during this period. Expected completion: February 2025.',
    category: 'Infrastructure',
    priority: 'urgent',
    isPublished: true,
    publishedAt: '2025-01-08T06:00:00Z',
    expiresAt: '2025-02-28T18:00:00Z',
    createdAt: '2025-01-08T06:00:00Z',
    author: 'Barangay Public Works',
  },
  {
    id: '4',
    title: 'Christmas Community Festival',
    summary: 'Annual Christmas celebration on December 24, 2024',
    content: 'Join us for our annual Christmas community festival featuring local performances, food stalls, games for children, and a special visit from Santa Claus. Event starts at 6:00 PM at the barangay hall.',
    category: 'Event',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2024-12-10T10:00:00Z',
    expiresAt: '2024-12-24T23:59:00Z',
    createdAt: '2024-12-10T10:00:00Z',
    author: 'Events Committee',
  },
  {
    id: '5',
    title: 'New Garbage Collection Schedule',
    summary: 'Updated waste collection schedule effective January 2025',
    content: 'Starting January 2025, garbage collection will be conducted every Tuesday and Friday. Residents are reminded to segregate waste properly and place garbage bins outside by 6:00 AM on collection days.',
    category: 'Environment',
    priority: 'normal',
    isPublished: true,
    publishedAt: '2024-12-12T07:00:00Z',
    expiresAt: null,
    createdAt: '2024-12-12T07:00:00Z',
    author: 'Sanitation Department',
  },
];

// GET /api/v1/announcements - Get all published announcements
router.get('/', (req, res) => {
  const { category, priority, limit = '10', offset = '0' } = req.query;
  
  let filteredAnnouncements = announcements.filter(a => a.isPublished);
  
  // Filter by category if provided
  if (category) {
    filteredAnnouncements = filteredAnnouncements.filter(
      a => a.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by priority if provided
  if (priority) {
    filteredAnnouncements = filteredAnnouncements.filter(
      a => a.priority.toLowerCase() === priority.toLowerCase()
    );
  }
  
  // Sort by published date (newest first)
  filteredAnnouncements.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Apply pagination
  const limitNum = parseInt(limit) || 10;
  const offsetNum = parseInt(offset) || 0;
  const paginatedAnnouncements = filteredAnnouncements.slice(offsetNum, offsetNum + limitNum);
  
  res.json({
    status: 'success',
    data: {
      announcements: paginatedAnnouncements,
      pagination: {
        total: filteredAnnouncements.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < filteredAnnouncements.length,
      },
    },
  });
});

// GET /api/v1/announcements/categories - Get available categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(announcements.map(a => a.category))];
  
  res.json({
    status: 'success',
    data: {
      categories,
    },
  });
});

// GET /api/v1/announcements/urgent - Get urgent announcements
router.get('/urgent', (req, res) => {
  const urgentAnnouncements = announcements.filter(
    a => a.isPublished && a.priority === 'urgent'
  );
  
  res.json({
    status: 'success',
    data: {
      announcements: urgentAnnouncements,
    },
  });
});

// GET /api/v1/announcements/:id - Get specific announcement
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const announcement = announcements.find(a => a.id === id && a.isPublished);
  
  if (!announcement) {
    return res.status(404).json({
      status: 'error',
      message: 'Announcement not found',
    });
  }
  
  res.json({
    status: 'success',
    data: {
      announcement,
    },
  });
});

module.exports = router;
