import React, { useState } from 'react';
import { 
  FaUpload, FaLink, FaEye, FaPalette, FaMusic, 
  FaFont, FaChartLine, FaCheck, FaSpinner, FaMagic 
} from 'react-icons/fa';

export default function StyleAnalyzer({ currentProject, onApplyBlueprint }) {
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState(null);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!referenceUrl && !analysisReport) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/reference/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceUrl: referenceUrl || 'https://instagram.com/reels/sample-viral-trend' })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisReport(data.analysis);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = async () => {
    if (!analysisReport || !currentProject) return;
    try {
      const res = await fetch('/api/reference/apply-to-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          analysisId: analysisReport.id
        })
      });
      const data = await res.json();
      if (data.success) {
        onApplyBlueprint?.(data.project);
        alert('Reference style blueprint successfully applied to your timeline!');
      }
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#090b10] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
            <span>Reference Reel & Video Style Analyzer</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Style Cloner
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Extract pacing, cut frequency, color grading, and subtitle dynamics from any viral Reel or cinematic video.
          </p>
        </div>
      </div>

      {/* Input Box: URL or Upload */}
      <div className="p-5 bg-studio-card border border-studio-border rounded-2xl space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Reference Video URL (Instagram Reel, YouTube Short, or TikTok)
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <FaLink className="absolute left-3.5 top-3 text-slate-500 text-xs" />
                <input
                  type="text"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="Paste Instagram Reel or YouTube Shorts URL (e.g. https://instagram.com/reel/...)"
                  className="w-full bg-[#0d1017] border border-studio-border focus:border-rose-500/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <FaEye className="text-xs" />
                    <span>Analyze Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Analysis Blueprint Report */}
      {analysisReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 rounded-2xl">
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Extracted Style Blueprint: {analysisReport.source}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                  {analysisReport.aspectRatio}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Ready to replicate styling onto project: <strong className="text-slate-200">{currentProject?.title}</strong>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <FaMagic className="text-xs" />
              <span>Apply Blueprint to My Project</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Pacing & Cuts */}
            <div className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                <FaChartLine />
                <span>Pacing & Cuts</span>
              </div>
              <div className="text-xl font-display font-extrabold text-white">
                {analysisReport.metrics.cutsPerMinute} <span className="text-xs font-normal text-slate-400">cuts/min</span>
              </div>
              <div className="text-xs text-slate-400">
                Avg Clip: <strong className="text-slate-200">{analysisReport.metrics.averageSceneDurationSec}s</strong>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-studio-border">
                {analysisReport.metrics.pacing}
              </div>
            </div>

            {/* 2. Color Palette */}
            <div className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                <FaPalette />
                <span>Color Palette</span>
              </div>
              <div className="flex items-center space-x-1.5 py-1">
                {analysisReport.colorPalette.dominantTones.map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c }}
                    className="w-7 h-7 rounded-lg border border-white/20 shadow-sm"
                    title={c}
                  />
                ))}
              </div>
              <div className="text-xs text-slate-200 font-medium">
                {analysisReport.colorPalette.gradingStyle}
              </div>
              <div className="text-[11px] text-slate-400">
                {analysisReport.colorPalette.contrastLevel}
              </div>
            </div>

            {/* 3. Subtitle Blueprint */}
            <div className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-yellow-400 text-xs font-bold">
                <FaFont />
                <span>Subtitles Style</span>
              </div>
              <div className="text-sm font-extrabold text-yellow-300 font-display">
                {analysisReport.subtitleBlueprint.style}
              </div>
              <div className="text-xs text-slate-300">
                Font: {analysisReport.subtitleBlueprint.fontFamily}
              </div>
              <div className="text-[11px] text-slate-400">
                Placement: {analysisReport.subtitleBlueprint.position}
              </div>
            </div>

            {/* 4. Audio Structure */}
            <div className="p-4 bg-studio-card border border-studio-border rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                <FaMusic />
                <span>Audio Structure</span>
              </div>
              <div className="text-xl font-display font-extrabold text-white">
                {analysisReport.metrics.tempoBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                ✓ Speech Ducking Enabled ({Math.round(analysisReport.audioStructure.duckingLevel * 100)}%)
              </div>
              <div className="text-[11px] text-slate-400">
                {analysisReport.audioStructure.sfxFrequency}
              </div>
            </div>
          </div>

          {/* Actionable Blueprint Checklist */}
          <div className="p-5 bg-studio-card border border-studio-border rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Actionable AI Editing Directives:
            </h4>
            <div className="space-y-2">
              {analysisReport.actionableBlueprint.map((directive, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                  <FaCheck className="text-emerald-400 text-xs mt-0.5 shrink-0" />
                  <span>{directive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
