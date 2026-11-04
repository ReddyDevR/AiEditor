import React, { useState } from 'react';
import { 
  FaCut, FaTrash, FaPlus, FaVolumeUp, FaVolumeMute, 
  FaEye, FaEyeSlash, FaSearchPlus, FaSearchMinus, FaCompressAlt 
} from 'react-icons/fa';

export default function MultiTrackTimeline({ 
  project, 
  onUpdateTimeline, 
  currentTime, 
  onTimeUpdate 
}) {
  const [zoomLevel, setZoomLevel] = useState(24); // pixels per second
  const [selectedClipId, setSelectedClipId] = useState(null);

  const duration = project?.duration || 18.0;
  const tracks = project?.timeline?.tracks || [];

  const handleSplitAtPlayhead = () => {
    if (!selectedClipId) return;

    const updatedTracks = tracks.map(track => {
      const clipIndex = track.clips.findIndex(c => c.id === selectedClipId);
      if (clipIndex === -1) return track;

      const clip = track.clips[clipIndex];
      const clipStart = clip.start;
      const clipEnd = clip.start + clip.duration;

      // Check if playhead is strictly inside this clip
      if (currentTime > clipStart && currentTime < clipEnd) {
        const firstDur = currentTime - clipStart;
        const secondDur = clipEnd - currentTime;

        const clipA = { ...clip, duration: Math.round(firstDur * 10) / 10 };
        const clipB = {
          ...clip,
          id: `clip_${Date.now()}_split`,
          title: `${clip.title} (Part 2)`,
          start: Math.round(currentTime * 10) / 10,
          duration: Math.round(secondDur * 10) / 10
        };

        const newClips = [...track.clips];
        newClips.splice(clipIndex, 1, clipA, clipB);
        return { ...track, clips: newClips };
      }
      return track;
    });

    onUpdateTimeline({ tracks: updatedTracks });
  };

  const handleDeleteClip = () => {
    if (!selectedClipId) return;
    const updatedTracks = tracks.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== selectedClipId)
    }));
    onUpdateTimeline({ tracks: updatedTracks });
    setSelectedClipId(null);
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickedSec = Math.max(0, Math.min(clickX / zoomLevel, duration));
    onTimeUpdate?.(clickedSec);
  };

  return (
    <div className="h-64 border-t border-studio-border bg-[#090b10] flex flex-col select-none">
      {/* Timeline Controls Toolbar */}
      <div className="h-10 border-b border-studio-border px-4 flex items-center justify-between bg-studio-sidebar/90">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSplitAtPlayhead}
            disabled={!selectedClipId}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-studio-hover border border-studio-border text-slate-300 text-xs disabled:opacity-40 transition-colors"
            title="Split selected clip at playhead (S)"
          >
            <FaCut className="text-[10px] text-rose-400" />
            <span>Split Clip</span>
          </button>

          <button
            onClick={handleDeleteClip}
            disabled={!selectedClipId}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-studio-card hover:bg-rose-500/20 hover:border-rose-500/40 border border-studio-border text-slate-300 text-xs disabled:opacity-40 transition-colors"
            title="Delete selected clip"
          >
            <FaTrash className="text-[10px] text-slate-400" />
            <span>Delete</span>
          </button>

          <div className="h-4 w-px bg-studio-border mx-1" />

          <div className="text-[11px] font-mono text-slate-400">
            Selected: <span className="text-slate-200">{selectedClipId ? selectedClipId.substring(0, 12) : 'None (Click a clip)'}</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoomLevel(Math.max(12, zoomLevel - 4))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-studio-hover text-xs"
            title="Zoom Out"
          >
            <FaSearchMinus />
          </button>
          <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{zoomLevel}x</span>
          <button
            onClick={() => setZoomLevel(Math.min(60, zoomLevel + 6))}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-studio-hover text-xs"
            title="Zoom In"
          >
            <FaSearchPlus />
          </button>
        </div>
      </div>

      {/* Tracks & Ruler Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left labels) */}
        <div className="w-48 border-r border-studio-border bg-studio-sidebar shrink-0 pt-6">
          {tracks.map(track => (
            <div 
              key={track.id}
              className="h-12 border-b border-studio-border/60 px-3 flex items-center justify-between text-xs text-slate-300"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className={`w-2 h-2 rounded-full ${
                  track.type === 'video' ? 'bg-blue-400' :
                  track.type === 'audio' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className="font-medium truncate">{track.name}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500">
                <button className="hover:text-slate-300 p-1"><FaEye className="text-[10px]" /></button>
                <button className="hover:text-slate-300 p-1"><FaVolumeUp className="text-[10px]" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Multi-Track Canvas & Playhead */}
        <div 
          onClick={handleTimelineClick}
          className="flex-1 overflow-x-auto relative bg-[#06080d] cursor-pointer"
        >
          {/* Time Ruler */}
          <div className="h-6 border-b border-studio-border/60 flex items-center text-[9px] font-mono text-slate-500 relative">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => (
              <div 
                key={sec}
                style={{ left: `${sec * zoomLevel}px` }}
                className="absolute flex flex-col items-center"
              >
                <span>{sec}s</span>
                <div className="h-1.5 w-px bg-slate-700 mt-0.5" />
              </div>
            ))}
          </div>

          {/* Tracks Lanes */}
          <div className="relative">
            {tracks.map(track => (
              <div 
                key={track.id}
                className="h-12 border-b border-studio-border/40 relative bg-studio-card/10"
              >
                {track.clips?.map(clip => {
                  const isSelected = selectedClipId === clip.id;
                  const leftPx = clip.start * zoomLevel;
                  const widthPx = clip.duration * zoomLevel;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      style={{
                        left: `${leftPx}px`,
                        width: `${widthPx}px`
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex flex-col justify-center text-xs shadow-sm transition-all border ${
                        isSelected 
                          ? 'ring-2 ring-white border-white z-10' 
                          : 'border-white/10 hover:border-white/30'
                      } ${
                        track.type === 'video'
                          ? 'bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white'
                          : track.type === 'audio'
                          ? 'bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 text-white'
                          : 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 text-white'
                      }`}
                    >
                      <div className="font-semibold text-[11px] truncate">{clip.title || clip.text}</div>
                      <div className="text-[9px] opacity-75 font-mono truncate">
                        {clip.duration}s {clip.filter && `• ${clip.filter}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Playhead Vertical Line */}
            <div 
              style={{ left: `${currentTime * zoomLevel}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none shadow-[0_0_10px_#f43f5e]"
            >
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -ml-1 -mt-1 shadow-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
