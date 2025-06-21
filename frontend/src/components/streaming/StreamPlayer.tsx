'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface StreamPlayerProps {
  streamId: string;
  hlsUrl: string;
  isLive: boolean;
  title: string;
  viewerCount?: number;
  showChat?: boolean;
  autoPlay?: boolean;
  className?: string;
}

export default function StreamPlayer({
  streamId,
  hlsUrl,
  isLive,
  title,
  viewerCount = 0,
  showChat = true,
  autoPlay = true,
  className = ''
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: isLive,
        backBufferLength: isLive ? 4 : 30,
        maxBufferLength: isLive ? 10 : 30,
        maxMaxBufferLength: isLive ? 20 : 60,
        liveSyncDurationCount: isLive ? 1 : 3,
        liveMaxLatencyDurationCount: isLive ? 3 : Infinity,
      });

      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Autoplay was prevented. Click play to start.');
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error occurred. Please check your connection.');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error occurred. Trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error occurred. Please refresh the page.');
              hls.destroy();
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) {
          video.play().catch(err => {
            console.warn('Autoplay failed:', err);
            setError('Autoplay was prevented. Click play to start.');
          });
        }
      });
    } else {
      setError('HLS is not supported in this browser.');
      setLoading(false);
    }

    // Video event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [hlsUrl, isLive, autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video. Please try again.');
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    video.muted = newVolume === 0;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  if (loading) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading stream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center p-6">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Stream Error</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden relative group ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        playsInline
        controls={false}
        muted={isMuted}
      />

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
      )}

      {/* Viewer Count */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
        <EyeIcon className="h-4 w-4" />
        {viewerCount.toLocaleString()}
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Center Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-black bg-opacity-50 text-white p-4 rounded-full hover:bg-opacity-75 transition-all duration-200"
          >
            {isPlaying ? (
              <PauseIcon className="h-8 w-8" />
            ) : (
              <PlayIcon className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-6 w-6" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Stream Title */}
            <div className="flex-1 text-center">
              <h3 className="text-white font-semibold truncate">{title}</h3>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {showChat && (
                <button className="text-white hover:text-gray-300">
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300"
              >
                <ArrowsPointingOutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click to Play Overlay (when paused) */}
      {!isPlaying && !loading && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="bg-black bg-opacity-50 text-white p-6 rounded-full">
            <PlayIcon className="h-12 w-12" />
          </div>
        </div>
      )}
    </div>
  );
}
