import express from 'express';
import { authenticate, restrictTo, optionalAuth } from '@/middleware/auth';

const router = express.Router();

// Mock surveys data
const surveysData = [
  {
    id: '1',
    title: 'Community Infrastructure Priorities',
    description: 'Help us prioritize infrastructure improvements for 2025',
    type: 'multiple_choice',
    status: 'active',
    isPublic: true,
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    createdBy: 'admin@barangay.gov.ph',
    createdAt: '2024-11-25T10:00:00Z',
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'Which infrastructure improvement is most important to you?',
        required: true,
        options: [
          { id: 'opt1', text: 'Road repairs and maintenance', votes: 45 },
          { id: 'opt2', text: 'Street lighting improvements', votes: 32 },
          { id: 'opt3', text: 'Drainage system upgrades', votes: 28 },
          { id: 'opt4', text: 'Public park development', votes: 15 }
        ]
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'How would you rate the current state of our roads?',
        required: true,
        scale: 5,
        averageRating: 3.2,
        totalResponses: 120
      }
    ],
    totalResponses: 120,
    targetResponses: 200
  },
  {
    id: '2',
    title: 'Barangay Services Satisfaction Survey',
    description: 'Your feedback helps us improve our services',
    type: 'mixed',
    status: 'active',
    isPublic: true,
    startDate: '2024-12-10T00:00:00Z',
    endDate: '2025-01-10T23:59:59Z',
    createdBy: 'admin@barangay.gov.ph',
    createdAt: '2024-12-05T14:30:00Z',
    questions: [
      {
        id: 'q1',
        type: 'rating',
        question: 'How satisfied are you with document processing services?',
        required: true,
        scale: 5,
        averageRating: 4.1,
        totalResponses: 85
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Which service do you use most frequently?',
        required: true,
        options: [
          { id: 'opt1', text: 'Barangay Clearance', votes: 35 },
          { id: 'opt2', text: 'Certificate of Residency', votes: 25 },
          { id: 'opt3', text: 'Business Permit', votes: 15 },
          { id: 'opt4', text: 'Indigency Certificate', votes: 10 }
        ]
      },
      {
        id: 'q3',
        type: 'text',
        question: 'What improvements would you like to see in our services?',
        required: false,
        responses: [
          'Faster processing times',
          'Online payment options',
          'Better customer service',
          'More convenient hours'
        ]
      }
    ],
    totalResponses: 85,
    targetResponses: 150
  },
  {
    id: '3',
    title: 'Emergency Preparedness Assessment',
    description: 'Help us understand community preparedness for emergencies',
    type: 'assessment',
    status: 'draft',
    isPublic: false,
    startDate: null,
    endDate: null,
    createdBy: 'admin@barangay.gov.ph',
    createdAt: '2024-12-18T09:15:00Z',
    questions: [
      {
        id: 'q1',
        type: 'yes_no',
        question: 'Do you have an emergency kit prepared at home?',
        required: true,
        yesCount: 0,
        noCount: 0
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'What type of emergencies are you most concerned about?',
        required: true,
        options: [
          { id: 'opt1', text: 'Flooding', votes: 0 },
          { id: 'opt2', text: 'Fire', votes: 0 },
          { id: 'opt3', text: 'Earthquake', votes: 0 },
          { id: 'opt4', text: 'Health emergencies', votes: 0 }
        ]
      }
    ],
    totalResponses: 0,
    targetResponses: 100
  }
];

// Mock responses data
const responsesData = [
  {
    id: '1',
    surveyId: '1',
    respondentId: 'user123',
    respondentEmail: 'user@email.com',
    submittedAt: '2024-12-15T14:30:00Z',
    responses: {
      q1: 'opt1',
      q2: 4
    }
  }
];

// GET /api/v1/surveys - Get all surveys
router.get('/', optionalAuth, (req, res) => {
  const { status, type } = req.query;
  const isAdmin = req.user?.role === 'admin';
  
  let filteredSurveys = isAdmin 
    ? [...surveysData] 
    : surveysData.filter(s => s.isPublic && s.status === 'active');
  
  if (status) {
    filteredSurveys = filteredSurveys.filter(s => s.status === status);
  }
  
  if (type) {
    filteredSurveys = filteredSurveys.filter(s => s.type === type);
  }
  
  // Remove detailed responses for non-admin users
  if (!isAdmin) {
    filteredSurveys = filteredSurveys.map(survey => ({
      ...survey,
      questions: survey.questions.map(q => ({
        ...q,
        responses: undefined // Remove detailed text responses
      }))
    }));
  }
  
  res.json({
    status: 'success',
    data: {
      surveys: filteredSurveys,
      summary: {
        total: filteredSurveys.length,
        active: filteredSurveys.filter(s => s.status === 'active').length,
        draft: filteredSurveys.filter(s => s.status === 'draft').length,
        completed: filteredSurveys.filter(s => s.status === 'completed').length
      }
    }
  });
});

// GET /api/v1/surveys/:id - Get specific survey
router.get('/:id', optionalAuth, (req, res) => {
  const survey = surveysData.find(s => s.id === req.params.id);
  
  if (!survey) {
    return res.status(404).json({
      status: 'error',
      message: 'Survey not found'
    });
  }
  
  const isAdmin = req.user?.role === 'admin';
  
  // Check if user can access this survey
  if (!isAdmin && (!survey.isPublic || survey.status !== 'active')) {
    return res.status(403).json({
      status: 'error',
      message: 'Survey not accessible'
    });
  }
  
  // Remove detailed responses for non-admin users
  let surveyData = { ...survey };
  if (!isAdmin) {
    surveyData.questions = survey.questions.map(q => ({
      ...q,
      responses: undefined
    }));
  }
  
  res.json({
    status: 'success',
    data: surveyData
  });
});

// POST /api/v1/surveys - Create new survey (admin only)
router.post('/', authenticate, restrictTo('admin'), (req, res) => {
  const {
    title,
    description,
    type,
    isPublic,
    startDate,
    endDate,
    questions,
    targetResponses
  } = req.body;
  
  if (!title || !description || !questions || !Array.isArray(questions)) {
    return res.status(400).json({
      status: 'error',
      message: 'Title, description, and questions are required'
    });
  }
  
  const newSurvey = {
    id: Date.now().toString(),
    title,
    description,
    type: type || 'mixed',
    status: 'draft',
    isPublic: isPublic || false,
    startDate: startDate || null,
    endDate: endDate || null,
    createdBy: req.user?.email || 'admin@barangay.gov.ph',
    createdAt: new Date().toISOString(),
    questions: questions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      ...q,
      votes: q.type === 'multiple_choice' ? q.options?.map((opt: any) => ({ ...opt, votes: 0 })) : undefined,
      yesCount: q.type === 'yes_no' ? 0 : undefined,
      noCount: q.type === 'yes_no' ? 0 : undefined,
      averageRating: q.type === 'rating' ? 0 : undefined,
      totalResponses: 0,
      responses: q.type === 'text' ? [] : undefined
    })),
    totalResponses: 0,
    targetResponses: targetResponses || 100
  };
  
  surveysData.push(newSurvey);
  
  res.status(201).json({
    status: 'success',
    message: 'Survey created successfully',
    data: newSurvey
  });
});

// POST /api/v1/surveys/:id/responses - Submit survey response
router.post('/:id/responses', optionalAuth, (req, res) => {
  const survey = surveysData.find(s => s.id === req.params.id);
  
  if (!survey) {
    return res.status(404).json({
      status: 'error',
      message: 'Survey not found'
    });
  }
  
  if (!survey.isPublic || survey.status !== 'active') {
    return res.status(403).json({
      status: 'error',
      message: 'Survey not available for responses'
    });
  }
  
  const { responses, respondentEmail } = req.body;
  
  if (!responses || typeof responses !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Responses are required'
    });
  }
  
  // Validate required questions
  const requiredQuestions = survey.questions.filter(q => q.required);
  for (const question of requiredQuestions) {
    if (!responses[question.id]) {
      return res.status(400).json({
        status: 'error',
        message: `Response required for question: ${question.question}`
      });
    }
  }
  
  const newResponse = {
    id: Date.now().toString(),
    surveyId: survey.id,
    respondentId: req.user?.id || 'anonymous',
    respondentEmail: respondentEmail || req.user?.email || null,
    submittedAt: new Date().toISOString(),
    responses
  };
  
  responsesData.push(newResponse);
  
  // Update survey statistics (simplified)
  survey.totalResponses += 1;
  
  res.status(201).json({
    status: 'success',
    message: 'Response submitted successfully',
    data: {
      id: newResponse.id,
      submittedAt: newResponse.submittedAt
    }
  });
});

// PUT /api/v1/surveys/:id - Update survey (admin only)
router.put('/:id', authenticate, restrictTo('admin'), (req, res) => {
  const surveyIndex = surveysData.findIndex(s => s.id === req.params.id);
  
  if (surveyIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Survey not found'
    });
  }
  
  const { title, description, status, isPublic, startDate, endDate } = req.body;
  
  if (title) surveysData[surveyIndex].title = title;
  if (description) surveysData[surveyIndex].description = description;
  if (status) surveysData[surveyIndex].status = status;
  if (typeof isPublic === 'boolean') surveysData[surveyIndex].isPublic = isPublic;
  if (startDate) surveysData[surveyIndex].startDate = startDate;
  if (endDate) surveysData[surveyIndex].endDate = endDate;
  
  res.json({
    status: 'success',
    message: 'Survey updated successfully',
    data: surveysData[surveyIndex]
  });
});

// GET /api/v1/surveys/:id/analytics - Get survey analytics (admin only)
router.get('/:id/analytics', authenticate, restrictTo('admin'), (req, res) => {
  const survey = surveysData.find(s => s.id === req.params.id);
  
  if (!survey) {
    return res.status(404).json({
      status: 'error',
      message: 'Survey not found'
    });
  }
  
  const surveyResponses = responsesData.filter(r => r.surveyId === survey.id);
  
  const analytics = {
    overview: {
      totalResponses: survey.totalResponses,
      targetResponses: survey.targetResponses,
      completionRate: (survey.totalResponses / survey.targetResponses) * 100,
      averageCompletionTime: 3.5, // minutes (mock)
      responseRate: 65.2 // percentage (mock)
    },
    demographics: {
      // Mock demographic data
      ageGroups: [
        { range: '18-25', count: 15, percentage: 18.8 },
        { range: '26-35', count: 25, percentage: 31.3 },
        { range: '36-45', count: 20, percentage: 25.0 },
        { range: '46-55', count: 15, percentage: 18.8 },
        { range: '56+', count: 5, percentage: 6.3 }
      ]
    },
    questionAnalytics: survey.questions.map(question => ({
      questionId: question.id,
      question: question.question,
      type: question.type,
      responseCount: question.totalResponses || survey.totalResponses,
      ...question
    }))
  };
  
  res.json({
    status: 'success',
    data: analytics
  });
});

export default router;
