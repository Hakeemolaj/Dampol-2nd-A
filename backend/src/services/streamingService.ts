import NodeMediaServer from 'node-media-server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { StreamsService } from './streamsService';
import StreamNotificationService from './streamNotificationService';

export interface StreamConfig {
  id: string;
  title: string;
  description?: string;
  streamKey: string;
  isLive: boolean;
  viewerCount: number;
  startedAt?: Date;
  endedAt?: Date;
  recordingEnabled: boolean;
  recordingPath?: string;
  hlsPath?: string;
}

export interface StreamSession {
  id: string;
  streamId: string;
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  ipAddress: string;
  userAgent: string;
}

export class StreamingService {
  private mediaServer: NodeMediaServer;
  private activeStreams: Map<string, StreamConfig> = new Map();
  private streamSessions: Map<string, StreamSession[]> = new Map();
  private recordingsPath: string;
  private hlsPath: string;
  private notificationService: StreamNotificationService;

  constructor() {
    // Set up paths for recordings and HLS segments
    this.recordingsPath = path.join(process.cwd(), 'storage', 'recordings');
    this.hlsPath = path.join(process.cwd(), 'storage', 'hls');

    // Initialize notification service
    this.notificationService = new StreamNotificationService();

    // Ensure directories exist
    this.ensureDirectories();

    // Configure Node Media Server
    this.mediaServer = new NodeMediaServer({
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
      },
      http: {
        port: 8000,
        mediaroot: './storage',
        allow_origin: '*'
      },
      relay: {
        ffmpeg: '/usr/bin/ffmpeg', // Adjust path as needed
        tasks: []
      }
    });

    this.setupEventHandlers();
  }

  private ensureDirectories(): void {
    [this.recordingsPath, this.hlsPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private setupEventHandlers(): void {
    // Handle stream publishing
    this.mediaServer.on('prePublish', async (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      // Extract stream key from path
      const streamKey = StreamPath.split('/').pop();
      if (!streamKey) {
        console.log('Invalid stream key');
        return;
      }

      // Validate stream key
      const isValid = await this.validateStreamKey(streamKey);
      if (!isValid) {
        console.log('Invalid stream key, rejecting stream');
        // Reject the stream
        return;
      }

      // Start recording and HLS if enabled
      await this.startStreamProcessing(streamKey, StreamPath);
    });

    // Handle stream end
    this.mediaServer.on('donePublish', async (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      
      const streamKey = StreamPath.split('/').pop();
      if (streamKey) {
        await this.stopStreamProcessing(streamKey);
      }
    });

    // Handle viewer connections
    this.mediaServer.on('prePlay', (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      this.incrementViewerCount(StreamPath);
    });

    // Handle viewer disconnections
    this.mediaServer.on('donePlay', (id: string, StreamPath: string, args: any) => {
      console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
      this.decrementViewerCount(StreamPath);
    });
  }

  private async validateStreamKey(streamKey: string): Promise<boolean> {
    try {
      const { data: stream, error } = await supabase
        .from('streams')
        .select('*')
        .eq('stream_key', streamKey)
        .eq('status', 'scheduled')
        .single();

      return !error && !!stream;
    } catch (error) {
      console.error('Error validating stream key:', error);
      return false;
    }
  }

  private async startStreamProcessing(streamKey: string, streamPath: string): Promise<void> {
    try {
      // Update stream status to live
      const { data: stream, error } = await supabase
        .from('streams')
        .update({
          status: 'live',
          started_at: new Date().toISOString(),
          viewer_count: 0
        })
        .eq('stream_key', streamKey)
        .select()
        .single();

      if (error || !stream) {
        console.error('Error updating stream status:', error);
        return;
      }

      // Set up HLS transcoding
      const hlsOutputPath = path.join(this.hlsPath, streamKey);
      if (!fs.existsSync(hlsOutputPath)) {
        fs.mkdirSync(hlsOutputPath, { recursive: true });
      }

      // Start HLS transcoding
      const hlsCommand = ffmpeg(`rtmp://localhost:1935${streamPath}`)
        .addOptions([
          '-c:v libx264',
          '-c:a aac',
          '-ac 1',
          '-strict -2',
          '-crf 20',
          '-profile:v baseline',
          '-maxrate 400k',
          '-bufsize 1835k',
          '-pix_fmt yuv420p',
          '-hls_time 10',
          '-hls_list_size 6',
          '-hls_wrap 10',
          '-start_number 1'
        ])
        .output(path.join(hlsOutputPath, 'index.m3u8'))
        .on('start', () => {
          console.log(`HLS transcoding started for stream: ${streamKey}`);
        })
        .on('error', (err) => {
          console.error(`HLS transcoding error for stream ${streamKey}:`, err);
        })
        .run();

      // Start recording if enabled
      if (stream.recording_enabled) {
        const recordingPath = path.join(this.recordingsPath, `${streamKey}_${Date.now()}.mp4`);
        
        const recordCommand = ffmpeg(`rtmp://localhost:1935${streamPath}`)
          .addOptions([
            '-c copy',
            '-f mp4'
          ])
          .output(recordingPath)
          .on('start', () => {
            console.log(`Recording started for stream: ${streamKey}`);
          })
          .on('end', async () => {
            console.log(`Recording ended for stream: ${streamKey}`);
            // Upload recording to Supabase Storage
            await this.uploadRecording(stream.id, recordingPath);
          })
          .on('error', (err) => {
            console.error(`Recording error for stream ${streamKey}:`, err);
          })
          .run();

        // Store recording path for cleanup
        await supabase
          .from('streams')
          .update({ recording_path: recordingPath })
          .eq('id', stream.id);
      }

      // Store stream config
      this.activeStreams.set(streamKey, {
        id: stream.id,
        title: stream.title,
        description: stream.description,
        streamKey,
        isLive: true,
        viewerCount: 0,
        startedAt: new Date(),
        recordingEnabled: stream.recording_enabled,
        recordingPath: stream.recording_path,
        hlsPath: `/hls/${streamKey}/index.m3u8`
      });

      // Send notification about stream start
      await this.notifyStreamStart(stream);
      await this.notificationService.notifyStreamLive(stream.id);

    } catch (error) {
      console.error('Error starting stream processing:', error);
    }
  }

  private async stopStreamProcessing(streamKey: string): Promise<void> {
    try {
      const streamConfig = this.activeStreams.get(streamKey);
      if (!streamConfig) return;

      // Update stream status
      await supabase
        .from('streams')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          final_viewer_count: streamConfig.viewerCount
        })
        .eq('stream_key', streamKey);

      // Clean up
      this.activeStreams.delete(streamKey);
      this.streamSessions.delete(streamKey);

      // Send notification about stream end
      await this.notifyStreamEnd(streamConfig);
      await this.notificationService.notifyStreamEnded(
        streamConfig.id,
        streamConfig.viewerCount,
        streamConfig.recordingEnabled
      );

      console.log(`Stream processing stopped for: ${streamKey}`);
    } catch (error) {
      console.error('Error stopping stream processing:', error);
    }
  }

  private incrementViewerCount(streamPath: string): void {
    const streamKey = streamPath.split('/').pop();
    if (!streamKey) return;

    const streamConfig = this.activeStreams.get(streamKey);
    if (streamConfig) {
      streamConfig.viewerCount++;
      
      // Update database
      supabase
        .from('streams')
        .update({ viewer_count: streamConfig.viewerCount })
        .eq('stream_key', streamKey)
        .then(() => {
          console.log(`Viewer count increased to ${streamConfig.viewerCount} for stream: ${streamKey}`);
        });
    }
  }

  private decrementViewerCount(streamPath: string): void {
    const streamKey = streamPath.split('/').pop();
    if (!streamKey) return;

    const streamConfig = this.activeStreams.get(streamKey);
    if (streamConfig && streamConfig.viewerCount > 0) {
      streamConfig.viewerCount--;
      
      // Update database
      supabase
        .from('streams')
        .update({ viewer_count: streamConfig.viewerCount })
        .eq('stream_key', streamKey)
        .then(() => {
          console.log(`Viewer count decreased to ${streamConfig.viewerCount} for stream: ${streamKey}`);
        });
    }
  }

  private async uploadRecording(streamId: string, recordingPath: string): Promise<void> {
    try {
      const fileName = path.basename(recordingPath);
      const fileBuffer = fs.readFileSync(recordingPath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('stream-recordings')
        .upload(`recordings/${fileName}`, fileBuffer, {
          contentType: 'video/mp4'
        });

      if (error) {
        console.error('Error uploading recording:', error);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('stream-recordings')
        .getPublicUrl(`recordings/${fileName}`);

      // Update stream record with recording URL
      await supabase
        .from('streams')
        .update({ recording_url: urlData.publicUrl })
        .eq('id', streamId);

      // Clean up local file
      fs.unlinkSync(recordingPath);

      console.log(`Recording uploaded successfully for stream: ${streamId}`);
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
  }

  private async notifyStreamStart(stream: any): Promise<void> {
    try {
      // Send notification to all residents about stream start
      const { data: residents, error } = await supabase
        .from('auth.users')
        .select('id')
        .eq('role', 'resident');

      if (!error && residents) {
        // Send real-time notification
        await supabase
          .channel('notifications')
          .send({
            type: 'broadcast',
            event: 'stream_started',
            payload: {
              stream_id: stream.id,
              title: stream.title,
              category: stream.category,
              hls_url: `/streams/${stream.id}/watch`
            }
          });

        console.log(`Stream started notification sent for: ${stream.title}`);
      }
    } catch (error) {
      console.error('Error sending stream start notification:', error);
    }
  }

  private async notifyStreamEnd(streamConfig: StreamConfig): Promise<void> {
    try {
      // Send notification about stream end and recording availability
      await supabase
        .channel('notifications')
        .send({
          type: 'broadcast',
          event: 'stream_ended',
          payload: {
            stream_id: streamConfig.id,
            title: streamConfig.title,
            recording_available: streamConfig.recordingEnabled,
            final_viewer_count: streamConfig.viewerCount
          }
        });

      console.log(`Stream ended notification sent for: ${streamConfig.title}`);
    } catch (error) {
      console.error('Error sending stream end notification:', error);
    }
  }

  public start(): void {
    this.mediaServer.run();
    console.log('Streaming server started on RTMP port 1935 and HTTP port 8000');
  }

  public stop(): void {
    this.mediaServer.stop();
    console.log('Streaming server stopped');
  }

  public getActiveStreams(): StreamConfig[] {
    return Array.from(this.activeStreams.values());
  }

  public getStreamByKey(streamKey: string): StreamConfig | undefined {
    return this.activeStreams.get(streamKey);
  }
}

export default StreamingService;
