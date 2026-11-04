import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaDownload, FaSpinner, FaCheckCircle, 
  FaMobileAlt, FaDesktop, FaSquare, FaFilm, FaFileVideo 
} from 'react-icons/fa';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  project, 
  mediaId 
}) {
  const [resolution, setResolution] = useState('1080p');
  const [aspectRatio, setAspectRatio] = useState(project?.aspectRatio || '9:16');
  const [fps, setFps] = useState(30);
  const [qualityPreset, setQualityPreset] = useState('balanced');
  
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [completedJob, setCompletedJob] = useState(null);

  useEffect(() => {
    if (project?.aspectRatio) {
      setAspectRatio(project.aspectRatio);
    }
  }, [project]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(5);
    setStageMessage('Submitting video to local render queue...');
    setCompletedJob(null);

    try {
      const res = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project?.id,
          mediaId: mediaId,
          aspectRatio,
          resolution,
          fps
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start render');
      }

      const jobId = data.job.id;

      // Connect to Server-Sent Events (SSE) for real-time progress
      const eventSource = new EventSource(`/api/render/events/${jobId}`);

      eventSource.onmessage = (event) => {
        try {
          const jobUpdate = JSON.parse(event.data);
          setProgress(jobUpdate.progress || 0);
          setStageMessage(jobUpdate.message || `Rendering in progress (${jobUpdate.progress}%)`);

          if (jobUpdate.status === 'completed') {
            setCompletedJob(jobUpdate);
            setIsExporting(false);
            eventSource.close();
          } else if (jobUpdate.status === 'failed') {
            setStageMessage(`Rendering failed: ${jobUpdate.error}`);
            setIsExporting(false);
            eventSource.close();
          }
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        // Fallback polling if SSE disconnects
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/render/status/${jobId}`);
            const statusData = await statusRes.json();
            if (statusData.job) {
              setProgress(statusData.job.progress || 0);
              setStageMessage(statusData.job.message || 'Rendering...');
              if (statusData.job.status === 'completed') {
                setCompletedJob(statusData.job);
                setIsExporting(false);
                clearInterval(pollInterval);
              }
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
          }
        }, 1500);
      };

    } catch (err) {
      console.error('Export error:', err);
      setStageMessage('Error: ' + err.message);
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.4 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0d1017] border border-studio-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-studio-border flex items-center justify-between bg-studio-sidebar">
          <div className="flex items-center space-x-2">
            <FaFilm className="text-rose-500 text-sm" />
            <span className="font-display font-extrabold text-sm text-white">
              Export Master Video
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-studio-hover transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Format / Aspect Ratio */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Platform & Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '9:16', label: 'Reel / Short', sub: '9:16 Vertical', icon: FaMobileAlt },
                { id: '16:9', label: 'YouTube Video', sub: '16:9 Cinema', icon: FaDesktop },
                { id: '1:1', label: 'Social Feed', sub: '1:1 Square', icon: FaSquare }
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = aspectRatio === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setAspectRatio(opt.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center space-y-1.5 transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                        : 'bg-studio-card border-studio-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="text-base text-rose-400" />
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-500">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution & FPS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-studio-card border border-studio-border rounded-xl p-2.5 text-slate-200 outline-none"
              >
                <option value="720p">720p HD (Fastest)</option>
                <option value="1080p">1080p Full HD (Recommended)</option>
                <option value="4k">4K Ultra HD (Master)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Frame Rate
              </label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10))}
                className="w-full bg-studio-card border border-studio-border rounded-xl p-2.5 text-slate-200 outline-none font-mono"
              >
                <option value="24">24 FPS (Cinematic Motion)</option>
                <option value="30">30 FPS (Standard Social)</option>
                <option value="60">60 FPS (Ultra Smooth)</option>
              </select>
            </div>
          </div>

          {/* Progress / Status Display */}
          {(isExporting || completedJob) && (
            <div className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white flex items-center space-x-2">
                  {isExporting ? (
                    <>
                      <FaSpinner className="animate-spin text-rose-500" />
                      <span>{stageMessage}</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Rendering Complete!</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-rose-400">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-studio-sidebar rounded-full overflow-hidden">
                <div 
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                />
              </div>

              {completedJob && (
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-white/5">
                  <span>File size: <strong className="text-slate-200">{formatFileSize(completedJob.fileSize)}</strong></span>
                  <span>Codec: <strong className="text-slate-200">H.264 / AAC</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-studio-border bg-studio-sidebar flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Powered by local FFmpeg 9.0 Full
          </div>

          <div className="flex items-center space-x-2">
            {completedJob ? (
              <a
                href={completedJob.downloadUrl}
                download
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <FaDownload className="text-xs" />
                <span>Download MP4 Video</span>
              </a>
            ) : (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Rendering Video...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="text-xs" />
                    <span>Start Render</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
