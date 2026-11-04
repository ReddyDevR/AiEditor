import React, { useState } from 'react';
import { 
  FaMagic, FaFilm, FaCamera, FaVolumeUp, FaPlay, 
  FaSpinner, FaDownload, FaSlidersH, FaCheckCircle 
} from 'react-icons/fa';

export default function AiVideoGen({ onVideoCreated }) {
  const [prompt, setPrompt] = useState('Futuristic cyber Hyderabad with flying electric autos and neon Charminar in monsoon rain');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [duration, setDuration] = useState(16);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [storyboard, setStoryboard] = useState(null);
  const [renderedResult, setRenderedResult] = useState(null);

  const handleGenerateStoryboard = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, duration })
      });
      const data = await res.json();
      if (data.success) {
        setStoryboard(data.storyboard);
        setRenderedResult(null);
      }
    } catch (err) {
      console.error('Storyboard error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRenderVideo = async () => {
    if (!storyboard || isRendering) return;
    setIsRendering(true);
    try {
      const res = await fetch('/api/generate/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyboardId: storyboard.id })
      });
      const data = await res.json();
      if (data.success) {
        setRenderedResult(data);
        onVideoCreated?.(data.media);
      }
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#090b10] space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <span>AI Text-to-Video & Storyboard Generator</span>
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Storyboard Engine
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Convert narrative prompts into multi-scene cinematic storyboards and render stitched videos with procedural visuals.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-5 bg-studio-card border border-studio-border rounded-2xl space-y-4">
        <form onSubmit={handleGenerateStoryboard} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Scene Concept Prompt (Telugu or English)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene concept in detail... (e.g. 'A 4k cinematic establishing shot of Araku coffee plantations with sunrise mist and traditional flutes')"
              rows={3}
              className="w-full bg-[#0d1017] border border-studio-border focus:border-purple-500/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              {/* Aspect Ratio */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Aspect Ratio:</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-studio-sidebar border border-studio-border rounded-lg text-xs text-slate-200 px-2.5 py-1.5 outline-none"
                >
                  <option value="9:16">9:16 Vertical Reel</option>
                  <option value="16:9">16:9 Cinema Widescreen</option>
                  <option value="1:1">1:1 Social Square</option>
                </select>
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Duration:</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  className="bg-studio-sidebar border border-studio-border rounded-lg text-xs text-slate-200 px-2.5 py-1.5 outline-none font-mono"
                >
                  <option value="12">12 Seconds</option>
                  <option value="16">16 Seconds</option>
                  <option value="24">24 Seconds</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Generating Storyboard...</span>
                </>
              ) : (
                <>
                  <FaMagic className="text-xs" />
                  <span>Generate Storyboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Storyboard Scenes Grid */}
      {storyboard && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
            <div>
              <div className="text-sm font-bold text-white">
                Cinematic Storyboard ({storyboard.scenes.length} Scenes • {storyboard.totalDurationSec}s)
              </div>
              <div className="text-xs text-purple-300 mt-0.5">
                Provider: {storyboard.provider}
              </div>
            </div>

            <button
              onClick={handleRenderVideo}
              disabled={isRendering}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {isRendering ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Rendering Final Video...</span>
                </>
              ) : (
                <>
                  <FaFilm className="text-xs" />
                  <span>Render Full AI Video (MP4)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storyboard.scenes.map((scene) => (
              <div 
                key={scene.sceneNumber}
                className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-3 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-studio-border pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
                      {scene.sceneNumber}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {scene.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-studio-sidebar px-2 py-0.5 rounded">
                    {scene.durationSec}s
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                  "{scene.prompt}"
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5 truncate">
                    <FaCamera className="text-purple-400 text-[10px] shrink-0" />
                    <span className="truncate">{scene.cameraMotion}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 truncate">
                    <FaVolumeUp className="text-emerald-400 text-[10px] shrink-0" />
                    <span className="truncate">{scene.audioCue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Render Result Card */}
          {renderedResult && (
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-studio-card to-transparent border border-emerald-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaCheckCircle className="text-emerald-400 text-2xl" />
                <div>
                  <div className="text-sm font-bold text-white">
                    Video Render Complete!
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Ready in {renderedResult.media.aspectRatio} format • Saved to project assets
                  </div>
                </div>
              </div>

              <a
                href={renderedResult.media.videoUrl}
                download
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                <FaDownload className="text-xs" />
                <span>Download MP4</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
