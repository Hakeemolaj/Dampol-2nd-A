'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface RecordedStreamPlayerProps {
  videoUrl: string;
  title: string;
  duration?: number;
  thumbnailUrl?: string;
  downloadEnabled?: boolean;
  chapters?: Array<{
    time: number;
    title: string;
    description?: string;
  }>;
  className?: string;
}

export default function RecordedStreamPlayer({
  videoUrl,
  title,
  duration,
  thumbnailUrl,
  downloadEnabled = false,
  chapters = [],
  className = ''
}: RecordedStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleError = () => {
      setError('Failed to load video');
      setLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * videoDuration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(videoDuration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
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

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const jumpToChapter = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentChapter = () => {
    return chapters.find((chapter, index) => {
      const nextChapter = chapters[index + 1];
      return currentTime >= chapter.time && (!nextChapter || currentTime < nextChapter.time);
    });
  };

  if (loading) {
    return (
      <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading video...</p>
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
            <h3 className="text-lg font-semibold mb-2">Video Error</h3>
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
        src={videoUrl}
        poster={thumbnailUrl}
        playsInline
        onMouseMove={() => setShowControls(true)}
        onClick={togglePlay}
      />

      {/* Current Chapter Indicator */}
      {getCurrentChapter() && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          {getCurrentChapter()?.title}
        </div>
      )}

      {/* Download Button */}
      {downloadEnabled && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => window.open(videoUrl, '_blank')}
            className="bg-black bg-opacity-75 text-white p-2 rounded hover:bg-opacity-90"
            title="Download video"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
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
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="w-full h-2 bg-gray-600 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              {/* Buffered Progress */}
              <div
                className="h-full bg-gray-400 rounded-full absolute"
                style={{ width: `${(buffered / videoDuration) * 100}%` }}
              />
              {/* Current Progress */}
              <div
                className="h-full bg-blue-500 rounded-full relative"
                style={{ width: `${(currentTime / videoDuration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

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

              <button
                onClick={() => skip(-10)}
                className="text-white hover:text-gray-300"
                title="Rewind 10s"
              >
                <BackwardIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => skip(10)}
                className="text-white hover:text-gray-300"
                title="Forward 10s"
              >
                <ForwardIcon className="h-5 w-5" />
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

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(videoDuration)}
              </div>
            </div>

            {/* Center Title */}
            <div className="flex-1 text-center">
              <h3 className="text-white font-semibold truncate">{title}</h3>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-gray-300"
                  title="Settings"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 text-white rounded p-2 min-w-32">
                    <div className="text-sm font-medium mb-2">Playback Speed</div>
                    {playbackRates.map(rate => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-2 py-1 text-sm hover:bg-gray-700 rounded ${
                          playbackRate === rate ? 'bg-blue-600' : ''
                        }`}
                      >
                        {rate}x
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
                  <ArrowsPointingInIcon className="h-6 w-6" />
                ) : (
                  <ArrowsPointingOutIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Sidebar */}
      {chapters.length > 0 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white rounded p-3 max-w-xs">
          <h4 className="text-sm font-semibold mb-2">Chapters</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => jumpToChapter(chapter.time)}
                className={`block w-full text-left p-2 text-xs rounded hover:bg-gray-700 ${
                  getCurrentChapter() === chapter ? 'bg-blue-600' : ''
                }`}
              >
                <div className="font-medium">{chapter.title}</div>
                <div className="text-gray-300">{formatTime(chapter.time)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
