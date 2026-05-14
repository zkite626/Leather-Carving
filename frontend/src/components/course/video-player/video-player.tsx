'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './video-player.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
  playbackRates?: number[];
}

const DEFAULT_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src,
  poster,
  onProgress,
  onComplete,
  initialPosition = 0,
  playbackRates = DEFAULT_RATES,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasSeekedRef = useRef(false);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  // Seek to initial position
  useEffect(() => {
    const video = videoRef.current;
    if (video && initialPosition > 0 && !hasSeekedRef.current) {
      const handleLoaded = () => {
        video.currentTime = initialPosition;
        hasSeekedRef.current = true;
      };
      video.addEventListener('loadedmetadata', handleLoaded);
      return () => video.removeEventListener('loadedmetadata', handleLoaded);
    }
  }, [initialPosition]);

  // Report progress every 10 seconds
  useEffect(() => {
    if (!onProgress || !playing) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        onProgress(video.currentTime, video.duration);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [onProgress, playing]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- UI state sync for controls visibility
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [playing, resetHideTimer]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    onComplete?.();
  }, [onComplete]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const video = videoRef.current;
      if (!bar || !video) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.currentTime = ratio * video.duration;
    },
    [],
  );

  const changeRate = useCallback(() => {
    const idx = playbackRates.indexOf(rate);
    const next = playbackRates[(idx + 1) % playbackRates.length];
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }, [rate, playbackRates]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(!muted);
  }, [muted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={styles.container}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={styles.video}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onClick={togglePlay}
        playsInline
      />

      {/* Play overlay for paused state */}
      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play" type="button">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.5)" />
            <path d="M24 18L46 32L24 46V18Z" fill="white" />
          </svg>
        </button>
      )}

      {/* Controls */}
      <div className={`${styles.controls} ${showControls ? '' : styles.hidden}`}>
        {/* Progress bar */}
        <div
          ref={progressRef}
          className={styles.progressBar}
          onClick={handleSeek}
          role="slider"
          aria-label="Video progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div className={styles.progressBuffer} />
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>

        <div className={styles.controlRow}>
          <div className={styles.controlLeft}>
            <button
              className={styles.controlBtn}
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              type="button"
            >
              {playing ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="4" y="3" width="4" height="14" rx="1" />
                  <rect x="12" y="3" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3L17 10L5 17V3Z" />
                </svg>
              )}
            </button>

            <div className={styles.volumeControl}>
              <button
                className={styles.controlBtn}
                onClick={toggleMute}
                aria-label={muted ? 'Unmute' : 'Mute'}
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  {muted || volume === 0 ? (
                    <path d="M3 7H6L11 3V17L6 13H3C2.45 13 2 12.55 2 12V8C2 7.45 2.45 7 3 7ZM16.5 10C16.5 7.5 15 5.7 13 5V7C14.1 7.8 14.5 9 14.5 10C14.5 11 14.1 12.2 13 13V15C15 14.3 16.5 12.5 16.5 10ZM11 10C11 8.7 10.6 7.6 10 6.8V8.5L11.5 10L10 11.5V13.2C10.6 12.4 11 11.3 11 10Z" />
                  ) : (
                    <path d="M3 7H6L11 3V17L6 13H3C2.45 13 2 12.55 2 12V8C2 7.45 2.45 7 3 7ZM13 7.3V5C14.8 5.9 16 7.8 16 10C16 12.2 14.8 14.1 13 15V12.7C14 11.8 14.5 11 14.5 10C14.5 9 14 8.2 13 7.3Z" />
                  )}
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                aria-label="Volume"
              />
            </div>

            <span className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={styles.controlRight}>
            <button
              className={styles.controlBtn}
              onClick={changeRate}
              aria-label={`Playback speed: ${rate}x`}
              type="button"
            >
              <span className={styles.rateLabel}>{rate}x</span>
            </button>

            <button
              className={styles.controlBtn}
              onClick={togglePiP}
              aria-label="Picture in Picture"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="10" y="10" width="6" height="4" rx="1" />
              </svg>
            </button>

            <button
              className={styles.controlBtn}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {isFullscreen ? (
                  <path d="M4 8V4H8M12 4H16V8M16 12V16H12M8 16H4V12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                ) : (
                  <path d="M4 4H8V5.5H5.5V8H4V4ZM12 4H16V8H14.5V5.5H12V4ZM16 16H12V14.5H14.5V12H16V16ZM4 16V12H5.5V14.5H8V16H4Z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
