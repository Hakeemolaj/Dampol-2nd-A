'use client';

import React, { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface MobileStreamPlayerProps {
  streamId: string;
  hlsUrl: string;
  isLive: boolean;
  title: string;
  viewerCount?: number;
  onChatToggle?: () => void;
  showChatButton?: boolean;
  className?: string;
}

export default function MobileStreamPlayer({
  streamId,
  hlsUrl,
  isLive,
  title,
  viewerCount = 0,
  onChatToggle,
  showChatButton = true,
  className = ''
}: MobileStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('auto');

  // Mobile-specific states
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    // Mobile-optimized HLS configuration
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 2 : 10,
        maxBufferLength: isLive ? 5 : 15,
        maxMaxBufferLength: isLive ? 10 : 30,
        liveSyncDurationCount: isLive ? 1 : 3,
        liveMaxLatencyDurationCount: isLive ? 2 : Infinity,
        // Mobile optimizations
        startLevel: -1, // Auto quality
        capLevelToPlayerSize: true,
        maxLoadingDelay: 4,
        maxBufferHole: 0.5,
        highBufferWatchdogPeriod: 2,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 3
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        // Auto-play on mobile requires user interaction
        if (isLive) {
          video.muted = true; // Enable autoplay on mobile
          video.play().catch(() => {
            setError('Tap to start playing');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error. Check your connection.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error. Trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              setError('Playback error. Please refresh.');
              break;
          }
        }
      });

      // Quality level management
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        setQuality(level ? `${level.height}p` : 'auto');
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    } else {
      setError('Video playback not supported on this device');
      setLoading(false);
    }

    // Mobile-specific event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('volumechange', handleVolumeChange);

    // Orientation change detection
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Initial orientation check
    handleOrientationChange();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('volumechange', handleVolumeChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [hlsUrl, isLive]);

  // Auto-hide controls on mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const handleVideoTouch = (e: React.TouchEvent) => {
    const currentTime = Date.now();
    const tapLength = currentTime - touchStartTime;
    
    if (tapLength < 500 && tapLength > 0) {
      // Single tap - toggle controls
      if (currentTime - lastTap < 300) {
        // Double tap - toggle play/pause
        togglePlay();
      } else {
        setShowControls(!showControls);
      }
      setLastTap(currentTime);
    }
  };

  const handleTouchStart = () => {
    setTouchStartTime(Date.now());
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // Unmute on first play if needed
      if (video.muted && isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Lock orientation to landscape in fullscreen
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {
            // Orientation lock failed, continue anyway
          });
        }
      }).catch(err => {
        console.error('Fullscreen failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        // Unlock orientation
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      });
    }
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setShowSettings(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center p-4">
            <div className="text-red-400 text-4xl mb-2">⚠️</div>
            <h3 className="text-sm font-semibold mb-1">Stream Error</h3>
            <p className="text-xs text-gray-300 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`bg-black rounded-lg overflow-hidden relative ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      } ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full ${isFullscreen ? 'h-full object-contain' : 'aspect-video'}`}
        playsInline
        controls={false}
        muted={isMuted}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleVideoTouch}
      />

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}

      {/* Viewer Count */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
        <EyeIcon className="h-3 w-3" />
        {viewerCount.toLocaleString()}
      </div>

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-75 text-white p-3 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        </div>
      )}

      {/* Mobile Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-200"
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300"
              >
                {isPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300"
              >
                {isMuted ? (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5" />
                )}
              </button>

              <div className="text-white text-xs">
                {quality}
              </div>
            </div>

            {/* Center Title (only in portrait) */}
            {orientation === 'portrait' && (
              <div className="flex-1 text-center px-2">
                <h3 className="text-white text-xs font-semibold truncate">{title}</h3>
              </div>
            )}

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {showChatButton && (
                <button
                  onClick={onChatToggle}
                  className="text-white hover:text-gray-300"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-gray-300"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
                
                {showSettings && hlsRef.current && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 text-white rounded p-2 min-w-24">
                    <div className="text-xs font-medium mb-1">Quality</div>
                    <button
                      onClick={() => changeQuality(-1)}
                      className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded ${
                        hlsRef.current.currentLevel === -1 ? 'bg-blue-600' : ''
                      }`}
                    >
                      Auto
                    </button>
                    {hlsRef.current.levels.map((level, index) => (
                      <button
                        key={index}
                        onClick={() => changeQuality(index)}
                        className={`block w-full text-left px-2 py-1 text-xs hover:bg-gray-700 rounded ${
                          hlsRef.current?.currentLevel === index ? 'bg-blue-600' : ''
                        }`}
                      >
                        {level.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tap Instructions */}
      {!isPlaying && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-75 text-white p-4 rounded-lg text-center">
            <DevicePhoneMobileIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm mb-1">Tap to play</p>
            <p className="text-xs text-gray-300">Double tap to play/pause</p>
          </div>
        </div>
      )}
    </div>
  );
}
