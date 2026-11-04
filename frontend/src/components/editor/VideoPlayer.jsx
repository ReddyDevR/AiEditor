import React, { useRef, useState, useEffect } from 'react';
import { 
  FaPlay, FaPause, FaUndo, FaRedo, FaExpand, 
  FaVolumeUp, FaVolumeMute, FaSyncAlt, FaSlidersH, FaFilm 
} from 'react-icons/fa';

export default function VideoPlayer({ 
  project, 
  currentTime = 0, 
  onTimeUpdate, 
  mediaUrl,
  isPlaying,
  setIsPlaying
}) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(15.0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  const aspectRatio = project?.aspectRatio || '9:16';

  // Video track active filter
  const videoTrack = project?.timeline?.tracks?.find(t => t.type === 'video');
  const activeFilter = videoTrack?.clips?.[0]?.filter || 'teal_orange';

  // Active subtitles track
  const subTrack = project?.timeline?.tracks?.find(t => t.type === 'subtitles');
  const currentSubtitle = subTrack?.clips?.find(
    s => currentTime >= s.start && currentTime <= (s.start + s.duration)
  );

  // Sync external currentTime prop to video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.4) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(e => console.warn('Play error:', e));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || project?.duration || 15.0);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    onTimeUpdate?.(val);
  };

  const skipSeconds = (sec) => {
    if (videoRef.current) {
      const nextTime = Math.min(Math.max(0, videoRef.current.currentTime + sec), duration);
      videoRef.current.currentTime = nextTime;
      onTimeUpdate?.(nextTime);
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (timeInSec) => {
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    const ms = Math.floor((timeInSec % 1) * 10);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}.${ms}`;
  };

  // Filter styles simulation
  const getFilterStyle = (preset) => {
    switch (preset) {
      case 'teal_orange':
        return 'contrast(118%) saturate(125%) hue-rotate(-5deg)';
      case 'moody_warm':
        return 'contrast(114%) saturate(95%) sepia(18%)';
      case 'neon_cyberpunk':
        return 'contrast(130%) saturate(145%) hue-rotate(15deg)';
      case 'noir_bw':
        return 'grayscale(100%) contrast(140%) brightness(95%)';
      case 'vintage_retro':
        return 'contrast(105%) saturate(85%) sepia(25%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1017] rounded-none overflow-hidden select-none">
      {/* Player Frame Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-3 bg-gradient-to-b from-[#080a0f] to-[#0d1017] overflow-hidden">
        {/* Dynamic Aspect Ratio Container */}
        <div 
          className={`relative overflow-hidden bg-black shadow-2xl transition-all duration-300 flex items-center justify-center border border-white/10 ${
            aspectRatio === '9:16'
              ? 'h-full max-h-[480px] aspect-[9/16] rounded-2xl ring-1 ring-white/10'
              : aspectRatio === '1:1'
              ? 'h-full max-h-[460px] aspect-square rounded-xl'
              : 'w-full max-w-[680px] aspect-video rounded-xl'
          }`}
        >
          {mediaUrl ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              loop={isLooping}
              className="w-full h-full object-cover transition-all"
              style={{ filter: getFilterStyle(activeFilter) }}
            />
          ) : (
            /* Procedural Animated Studio Canvas */
            <div 
              className="w-full h-full flex flex-col items-center justify-center relative p-6 text-center"
              style={{ 
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #450a0a 100%)',
                filter: getFilterStyle(activeFilter)
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 text-2xl mb-3 shadow-inner">
                <FaFilm />
              </div>
              <div className="font-display font-extrabold text-sm text-white tracking-wide">
                REDDY AI STUDIO
              </div>
              <div className="text-[11px] text-amber-300 font-medium mt-1">
                {project?.title || 'Autonomous Video Engine'}
              </div>
              <div className="absolute top-3 right-3 text-[9px] font-mono px-2 py-0.5 bg-black/40 text-slate-300 rounded border border-white/10">
                {aspectRatio} • {formatTime(currentTime)}
              </div>
            </div>
          )}

          {/* Live Subtitle Overlay */}
          {currentSubtitle && (
            <div className="absolute bottom-10 inset-x-4 flex justify-center pointer-events-none z-10 transition-all">
              <div className="hormozi-subtitle text-center px-4 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-yellow-400/20 text-xs md:text-sm tracking-wide">
                {currentSubtitle.text}
              </div>
            </div>
          )}

          {/* Active Preset Tag Overlay */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="capitalize">{activeFilter.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Scrub Bar & Player Controls Bar */}
      <div className="p-3 bg-studio-sidebar border-t border-studio-border space-y-2">
        {/* Scrubber Slider */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] font-mono text-slate-400 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 15}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-studio-card rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => skipSeconds(-5)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-studio-hover text-xs transition-colors"
              title="Rewind 5s"
            >
              <FaUndo className="text-[11px]" />
            </button>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all"
            >
              {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
            </button>

            <button
              onClick={() => skipSeconds(5)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-studio-hover text-xs transition-colors"
              title="Forward 5s"
            >
              <FaRedo className="text-[11px]" />
            </button>

            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded text-xs transition-colors ${
                isLooping ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Loop"
            >
              <FaSyncAlt className="text-[11px]" />
            </button>
          </div>

          {/* Speed & Volume */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-studio-card rounded-md p-0.5 border border-studio-border text-[11px] font-mono">
              {[0.5, 1.0, 1.5, 2.0].map(s => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === s ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-studio-hover text-xs"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
