import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create new stream
router.post('/',
  authenticate,
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('scheduled_at').optional().isISO8601(),
    body('recording_enabled').optional().isBoolean(),
    body('is_public').optional().isBoolean(),
    body('category').optional().isIn(['meeting', 'emergency', 'event', 'announcement', 'education'])
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const {
        title,
        description,
        scheduled_at,
        recording_enabled = true,
        is_public = true,
        category = 'meeting'
      } = req.body;

      const user = (req as any).user;
      const streamKey = uuidv4();

      const { data: stream, error } = await supabase
        .from('streams')
        .insert({
          title,
          description,
          stream_key: streamKey,
          scheduled_at: scheduled_at || new Date().toISOString(),
          recording_enabled,
          is_public,
          category,
          status: 'scheduled',
          created_by: user.id,
          viewer_count: 0
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create stream',
          error: error.message
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Stream created successfully',
        data: {
          ...stream,
          rtmp_url: `rtmp://localhost:1935/live/${streamKey}`,
          hls_url: `http://localhost:8000/hls/${streamKey}/index.m3u8`
        }
      });
    } catch (error) {
      console.error('Error creating stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get all streams
router.get('/',
  [
    query('status').optional().isIn(['scheduled', 'live', 'ended', 'cancelled']),
    query('category').optional().isIn(['meeting', 'emergency', 'event', 'announcement', 'education']),
    query('is_public').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const {
        status,
        category,
        is_public,
        page = 1,
        limit = 20
      } = req.query;

      let query = supabase
        .from('streams')
        .select(`
          *,
          created_by_user:auth.users!streams_created_by_fkey(
            id,
            email,
            user_metadata
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (is_public !== undefined) {
        query = query.eq('is_public', is_public);
      }

      // Apply pagination
      const offset = (Number(page) - 1) * Number(limit);
      query = query.range(offset, offset + Number(limit) - 1);

      const { data: streams, error, count } = await query;

      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch streams',
          error: error.message
        });
      }

      res.json({
        status: 'success',
        data: streams,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching streams:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get stream by ID
router.get('/:id',
  [param('id').isUUID()],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      const { data: stream, error } = await supabase
        .from('streams')
        .select(`
          *,
          created_by_user:auth.users!streams_created_by_fkey(
            id,
            email,
            user_metadata
          )
        `)
        .eq('id', id)
        .single();

      if (error || !stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      // Add streaming URLs
      const streamData = {
        ...stream,
        rtmp_url: `rtmp://localhost:1935/live/${stream.stream_key}`,
        hls_url: `http://localhost:8000/hls/${stream.stream_key}/index.m3u8`
      };

      res.json({
        status: 'success',
        data: streamData
      });
    } catch (error) {
      console.error('Error fetching stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Update stream
router.put('/:id',
  authenticate,
  [
    param('id').isUUID(),
    body('title').optional().notEmpty().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('scheduled_at').optional().isISO8601(),
    body('recording_enabled').optional().isBoolean(),
    body('is_public').optional().isBoolean(),
    body('category').optional().isIn(['meeting', 'emergency', 'event', 'announcement', 'education'])
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const updateData = req.body;

      // Check if user owns the stream or is admin
      const { data: stream, error: fetchError } = await supabase
        .from('streams')
        .select('created_by, status')
        .eq('id', id)
        .single();

      if (fetchError || !stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      if (stream.created_by !== user.id && user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this stream'
        });
      }

      // Don't allow updates to live streams
      if (stream.status === 'live') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot update live stream'
        });
      }

      const { data: updatedStream, error } = await supabase
        .from('streams')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to update stream',
          error: error.message
        });
      }

      res.json({
        status: 'success',
        message: 'Stream updated successfully',
        data: updatedStream
      });
    } catch (error) {
      console.error('Error updating stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Delete stream
router.delete('/:id',
  authenticate,
  [param('id').isUUID()],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      // Check if user owns the stream or is admin
      const { data: stream, error: fetchError } = await supabase
        .from('streams')
        .select('created_by, status')
        .eq('id', id)
        .single();

      if (fetchError || !stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      if (stream.created_by !== user.id && user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this stream'
        });
      }

      // Don't allow deletion of live streams
      if (stream.status === 'live') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete live stream'
        });
      }

      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to delete stream',
          error: error.message
        });
      }

      res.json({
        status: 'success',
        message: 'Stream deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Get stream analytics
router.get('/:id/analytics',
  authenticate,
  [param('id').isUUID()],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      // Get stream details
      const { data: stream, error: streamError } = await supabase
        .from('streams')
        .select('*')
        .eq('id', id)
        .single();

      if (streamError || !stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      // Get viewer sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('stream_viewers')
        .select('*')
        .eq('stream_id', id);

      if (sessionsError) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to fetch analytics',
          error: sessionsError.message
        });
      }

      // Calculate analytics
      const totalViewers = sessions?.length || 0;
      const uniqueViewers = new Set(sessions?.map(s => s.user_id)).size;
      const averageWatchTime = sessions?.reduce((acc, session) => {
        if (session.left_at) {
          const watchTime = new Date(session.left_at).getTime() - new Date(session.joined_at).getTime();
          return acc + watchTime;
        }
        return acc;
      }, 0) / (sessions?.length || 1);

      res.json({
        status: 'success',
        data: {
          stream_id: id,
          total_viewers: totalViewers,
          unique_viewers: uniqueViewers,
          peak_viewers: stream.viewer_count || 0,
          average_watch_time: Math.round(averageWatchTime / 1000), // in seconds
          duration: stream.ended_at && stream.started_at 
            ? new Date(stream.ended_at).getTime() - new Date(stream.started_at).getTime()
            : null,
          sessions: sessions || []
        }
      });
    } catch (error) {
      console.error('Error fetching stream analytics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

export default router;
