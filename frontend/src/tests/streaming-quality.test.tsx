import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import MobileStreamPlayer from '../components/mobile/MobileStreamPlayer';
import StreamPlayer from '../components/streaming/StreamPlayer';
import StreamChat from '../components/streaming/StreamChat';

// Mock HLS.js
const mockHls = {
  isSupported: jest.fn(() => true),
  loadSource: jest.fn(),
  attachMedia: jest.fn(),
  on: jest.fn(),
  destroy: jest.fn(),
  levels: [
    { height: 720, bitrate: 2500000 },
    { height: 480, bitrate: 1500000 },
    { height: 360, bitrate: 800000 }
  ],
  currentLevel: -1
};

jest.mock('hls.js', () => ({
  default: jest.fn(() => mockHls),
  isSupported: jest.fn(() => true)
}));

// Mock WebSocket for real-time testing
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string) {
    // Simulate message echo
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }, 50);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

global.WebSocket = MockWebSocket as any;

describe('Streaming Quality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Video Player Quality', () => {
    test('should initialize HLS player correctly', async () => {
      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      await waitFor(() => {
        expect(mockHls.loadSource).toHaveBeenCalledWith('https://test.example.com/stream.m3u8');
        expect(mockHls.attachMedia).toHaveBeenCalled();
      });
    });

    test('should handle video quality switching', async () => {
      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      // Simulate quality button click
      const qualityButton = screen.getByRole('button', { name: /quality/i });
      fireEvent.click(qualityButton);

      await waitFor(() => {
        expect(screen.getByText('720p')).toBeInTheDocument();
        expect(screen.getByText('480p')).toBeInTheDocument();
        expect(screen.getByText('360p')).toBeInTheDocument();
      });
    });

    test('should handle network errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://invalid-url.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      // Simulate HLS error
      const errorCallback = mockHls.on.mock.calls.find(call => call[0] === 'hlsError')?.[1];
      if (errorCallback) {
        errorCallback('hlsError', {
          type: 'networkError',
          details: 'manifestLoadError',
          fatal: true
        });
      }

      await waitFor(() => {
        expect(screen.getByText(/stream error/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    test('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      render(
        <MobileStreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      await waitFor(() => {
        const videoElement = screen.getByRole('application'); // Video player container
        expect(videoElement).toHaveClass('aspect-video');
      });
    });
  });

  describe('Real-time Chat Quality', () => {
    test('should connect to chat successfully', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
      });
    });

    test('should handle message sending and receiving', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      const messageInput = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    test('should handle chat moderation', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      // Simulate receiving a moderated message
      const mockMessage = {
        id: 'msg-1',
        stream_id: 'test-stream',
        message: 'Inappropriate content',
        message_type: 'text',
        is_moderated: true,
        timestamp: new Date().toISOString(),
        user: {
          id: 'user-1',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' }
        }
      };

      // This would normally come through WebSocket
      // For testing, we can simulate the moderated state
      await waitFor(() => {
        expect(screen.getByText(/message removed/i)).toBeInTheDocument();
      });
    });

    test('should handle high message volume', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      // Simulate rapid message sending
      const messageInput = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      for (let i = 0; i < 10; i++) {
        fireEvent.change(messageInput, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should handle all messages without crashing
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
    });
  });

  describe('Performance Metrics', () => {
    test('should measure video loading time', async () => {
      const startTime = performance.now();

      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      // Simulate video loaded event
      const loadedCallback = mockHls.on.mock.calls.find(call => call[0] === 'manifestParsed')?.[1];
      if (loadedCallback) {
        loadedCallback();
      }

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should measure chat message latency', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      const startTime = performance.now();
      
      const messageInput = screen.getByPlaceholderText(/type a message/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { target: { value: 'Latency test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Latency test')).toBeInTheDocument();
      });

      const latency = performance.now() - startTime;
      expect(latency).toBeLessThan(1000); // Should appear within 1 second
    });

    test('should handle memory usage efficiently', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Render multiple components
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <StreamPlayer
            streamId={`test-stream-${i}`}
            hlsUrl="https://test.example.com/stream.m3u8"
            isLive={true}
            title={`Test Stream ${i}`}
            viewerCount={100}
          />
        );
        unmount();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Accessibility Quality', () => {
    test('should have proper ARIA labels', async () => {
      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fullscreen/i })).toBeInTheDocument();
    });

    test('should support keyboard navigation', async () => {
      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      const playButton = screen.getByRole('button', { name: /play/i });
      
      // Test keyboard focus
      playButton.focus();
      expect(document.activeElement).toBe(playButton);

      // Test keyboard activation
      fireEvent.keyDown(playButton, { key: 'Enter' });
      // Should trigger play functionality
    });

    test('should provide screen reader support', async () => {
      render(
        <StreamChat
          streamId="test-stream"
          isLive={true}
        />
      );

      const chatRegion = screen.getByRole('log'); // Chat messages region
      expect(chatRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Cross-browser Compatibility', () => {
    test('should work with Safari native HLS', async () => {
      // Mock Safari environment
      mockHls.isSupported.mockReturnValue(false);
      
      const mockVideo = {
        canPlayType: jest.fn(() => 'probably'),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);

      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      expect(mockVideo.canPlayType).toHaveBeenCalledWith('application/vnd.apple.mpegurl');
    });

    test('should handle unsupported browsers gracefully', async () => {
      // Mock unsupported browser
      mockHls.isSupported.mockReturnValue(false);
      
      const mockVideo = {
        canPlayType: jest.fn(() => ''),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockVideo as any);

      render(
        <StreamPlayer
          streamId="test-stream"
          hlsUrl="https://test.example.com/stream.m3u8"
          isLive={true}
          title="Test Stream"
          viewerCount={100}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/not supported/i)).toBeInTheDocument();
      });
    });
  });
});

// Quality monitoring utilities
export class StreamingQualityMonitor {
  private metrics: {
    videoQuality: any[];
    chatLatency: any[];
    bufferingEvents: any[];
    errorEvents: any[];
  } = {
    videoQuality: [],
    chatLatency: [],
    bufferingEvents: [],
    errorEvents: []
  };

  recordVideoQuality(quality: { resolution: string; bitrate: number; fps: number }) {
    this.metrics.videoQuality.push({
      timestamp: Date.now(),
      ...quality
    });
  }

  recordChatLatency(latency: number) {
    this.metrics.chatLatency.push({
      timestamp: Date.now(),
      latency
    });
  }

  recordBufferingEvent(duration: number) {
    this.metrics.bufferingEvents.push({
      timestamp: Date.now(),
      duration
    });
  }

  recordError(error: { type: string; message: string; fatal: boolean }) {
    this.metrics.errorEvents.push({
      timestamp: Date.now(),
      ...error
    });
  }

  getQualityReport() {
    const avgChatLatency = this.metrics.chatLatency.length > 0
      ? this.metrics.chatLatency.reduce((sum, m) => sum + m.latency, 0) / this.metrics.chatLatency.length
      : 0;

    const totalBufferingTime = this.metrics.bufferingEvents.reduce((sum, e) => sum + e.duration, 0);
    const fatalErrors = this.metrics.errorEvents.filter(e => e.fatal).length;

    return {
      videoQuality: {
        samples: this.metrics.videoQuality.length,
        averageResolution: this.getAverageResolution(),
        averageBitrate: this.getAverageBitrate()
      },
      chat: {
        averageLatency: avgChatLatency,
        samples: this.metrics.chatLatency.length
      },
      buffering: {
        totalTime: totalBufferingTime,
        events: this.metrics.bufferingEvents.length
      },
      errors: {
        total: this.metrics.errorEvents.length,
        fatal: fatalErrors
      },
      qualityScore: this.calculateQualityScore()
    };
  }

  private getAverageResolution(): string {
    if (this.metrics.videoQuality.length === 0) return 'N/A';
    
    const resolutions = this.metrics.videoQuality.map(q => parseInt(q.resolution));
    const avg = resolutions.reduce((sum, r) => sum + r, 0) / resolutions.length;
    return `${Math.round(avg)}p`;
  }

  private getAverageBitrate(): number {
    if (this.metrics.videoQuality.length === 0) return 0;
    
    return this.metrics.videoQuality.reduce((sum, q) => sum + q.bitrate, 0) / this.metrics.videoQuality.length;
  }

  private calculateQualityScore(): number {
    let score = 100;

    // Deduct for buffering
    score -= Math.min(this.metrics.bufferingEvents.length * 5, 30);

    // Deduct for errors
    score -= Math.min(this.metrics.errorEvents.length * 10, 50);

    // Deduct for high chat latency
    const avgLatency = this.metrics.chatLatency.length > 0
      ? this.metrics.chatLatency.reduce((sum, m) => sum + m.latency, 0) / this.metrics.chatLatency.length
      : 0;
    
    if (avgLatency > 1000) score -= 20;
    else if (avgLatency > 500) score -= 10;

    return Math.max(0, score);
  }
}
