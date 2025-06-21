import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth';
import StreamsService from '../services/streamsService';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const streamsService = new StreamsService();

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

// Get chat messages for a stream
router.get('/:streamId/messages',
  [
    param('streamId').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      // Check if stream exists and is accessible
      const stream = await streamsService.getStreamById(streamId);
      if (!stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      // Check if stream is public or user has access
      if (!stream.is_public) {
        // Add authentication check here if needed
        // For now, allow access to all authenticated users
      }

      const messages = await streamsService.getChatMessages(streamId, limit, offset);

      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Send chat message
router.post('/:streamId/messages',
  authenticate,
  [
    param('streamId').isUUID(),
    body('message').notEmpty().isLength({ max: 500 }),
    body('message_type').optional().isIn(['text', 'emoji', 'reaction']),
    body('reply_to_id').optional().isUUID()
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId } = req.params;
      const { message, message_type = 'text', reply_to_id } = req.body;
      const user = (req as any).user;

      // Check if stream exists and is live
      const stream = await streamsService.getStreamById(streamId);
      if (!stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      if (stream.status !== 'live') {
        return res.status(400).json({
          status: 'error',
          message: 'Chat is only available during live streams'
        });
      }

      // Add chat message
      const chatMessage = await streamsService.addChatMessage({
        stream_id: streamId,
        user_id: user.id,
        message,
        message_type,
        reply_to_id,
        timestamp: new Date().toISOString()
      });

      // Send real-time update via Supabase
      await supabase
        .channel(`stream:${streamId}`)
        .send({
          type: 'broadcast',
          event: 'chat_message',
          payload: {
            ...chatMessage,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata
            }
          }
        });

      res.status(201).json({
        status: 'success',
        message: 'Chat message sent successfully',
        data: chatMessage
      });
    } catch (error) {
      console.error('Error sending chat message:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Moderate chat message
router.put('/:streamId/messages/:messageId/moderate',
  authenticate,
  [
    param('streamId').isUUID(),
    param('messageId').isUUID(),
    body('reason').optional().isLength({ max: 200 })
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId, messageId } = req.params;
      const { reason } = req.body;
      const user = (req as any).user;

      // Check if user is a moderator or admin
      const { data: moderator, error: modError } = await supabase
        .from('stream_moderators')
        .select('*')
        .eq('stream_id', streamId)
        .eq('user_id', user.id)
        .eq('can_moderate_chat', true)
        .single();

      if (modError && user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to moderate chat'
        });
      }

      await streamsService.moderateChatMessage(messageId, user.id, reason);

      // Send real-time update
      await supabase
        .channel(`stream:${streamId}`)
        .send({
          type: 'broadcast',
          event: 'message_moderated',
          payload: {
            message_id: messageId,
            moderated_by: user.id,
            reason
          }
        });

      res.json({
        status: 'success',
        message: 'Message moderated successfully'
      });
    } catch (error) {
      console.error('Error moderating message:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Join stream as viewer
router.post('/:streamId/join',
  [
    param('streamId').isUUID(),
    body('session_id').optional().isUUID(),
    body('device_info').optional().isObject()
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId } = req.params;
      const { session_id, device_info } = req.body;
      const user = (req as any).user;

      // Check if stream exists
      const stream = await streamsService.getStreamById(streamId);
      if (!stream) {
        return res.status(404).json({
          status: 'error',
          message: 'Stream not found'
        });
      }

      // Add viewer
      const viewer = await streamsService.addViewer(streamId, {
        user_id: user?.id,
        session_id: session_id || uuidv4(),
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        device_type: device_info?.device_type,
        browser: device_info?.browser,
        location_data: device_info?.location
      });

      // Send real-time update
      await supabase
        .channel(`stream:${streamId}`)
        .send({
          type: 'broadcast',
          event: 'viewer_joined',
          payload: {
            viewer_count: stream.viewer_count + 1,
            viewer_id: viewer.id
          }
        });

      res.status(201).json({
        status: 'success',
        message: 'Joined stream successfully',
        data: {
          viewer_id: viewer.id,
          session_id: viewer.session_id,
          stream: {
            id: stream.id,
            title: stream.title,
            status: stream.status,
            hls_url: `http://localhost:8000/hls/${stream.stream_key}/index.m3u8`,
            viewer_count: stream.viewer_count + 1
          }
        }
      });
    } catch (error) {
      console.error('Error joining stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Leave stream
router.post('/:streamId/leave',
  [
    param('streamId').isUUID(),
    body('viewer_id').isUUID()
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId } = req.params;
      const { viewer_id } = req.body;

      await streamsService.removeViewer(viewer_id);

      // Send real-time update
      await supabase
        .channel(`stream:${streamId}`)
        .send({
          type: 'broadcast',
          event: 'viewer_left',
          payload: {
            viewer_id
          }
        });

      res.json({
        status: 'success',
        message: 'Left stream successfully'
      });
    } catch (error) {
      console.error('Error leaving stream:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

// Add reaction to stream
router.post('/:streamId/reactions',
  authenticate,
  [
    param('streamId').isUUID(),
    body('reaction_type').isIn(['like', 'love', 'laugh', 'wow', 'sad', 'angry']),
    body('reaction_emoji').optional().isLength({ max: 10 }),
    body('stream_time_seconds').optional().isInt({ min: 0 })
  ],
  handleValidationErrors,
  async (req: express.Request, res: express.Response) => {
    try {
      const { streamId } = req.params;
      const { reaction_type, reaction_emoji, stream_time_seconds } = req.body;
      const user = (req as any).user;

      // Check if stream is live
      const stream = await streamsService.getStreamById(streamId);
      if (!stream || stream.status !== 'live') {
        return res.status(400).json({
          status: 'error',
          message: 'Reactions are only available during live streams'
        });
      }

      // Add reaction
      const { data: reaction, error } = await supabase
        .from('stream_reactions')
        .insert({
          stream_id: streamId,
          user_id: user.id,
          reaction_type,
          reaction_emoji,
          stream_time_seconds,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add reaction: ${error.message}`);
      }

      // Send real-time update
      await supabase
        .channel(`stream:${streamId}`)
        .send({
          type: 'broadcast',
          event: 'reaction_added',
          payload: {
            ...reaction,
            user: {
              id: user.id,
              email: user.email,
              user_metadata: user.user_metadata
            }
          }
        });

      res.status(201).json({
        status: 'success',
        message: 'Reaction added successfully',
        data: reaction
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
);

export default router;
