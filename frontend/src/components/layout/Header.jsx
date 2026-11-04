import React from 'react';
import { 
  FaPlay, FaUndo, FaRedo, FaDownload, FaRobot, 
  FaMobileAlt, FaDesktop, FaSquare 
} from 'react-icons/fa';

export default function Header({ 
  currentProject, 
  onUpdateProject, 
  onOpenExport, 
  isRendering, 
  activeView,
  setActiveView 
}) {
  const aspectRatios = [
    { id: '9:16', label: '9:16 Reel', icon: FaMobileAlt },
    { id: '16:9', label: '16:9 Cinema', icon: FaDesktop },
    { id: '1:1', label: '1:1 Square', icon: FaSquare }
  ];

  return (
    <header className="h-14 border-b border-studio-border bg-studio-sidebar/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => setActiveView('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090b10] rounded-[7px] flex items-center justify-center">
              <span className="font-display font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">R</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-sm tracking-wider text-white">REDDY</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded border border-rose-500/30">STUDIO</span>
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-studio-border mx-2" />

        {/* Project Title Input */}
        <input
          type="text"
          value={currentProject?.title || 'Untitled Project'}
          onChange={(e) => onUpdateProject({ title: e.target.value })}
          className="bg-transparent hover:bg-studio-card/60 focus:bg-studio-card text-xs font-medium text-slate-200 px-2 py-1 rounded border border-transparent hover:border-studio-border focus:border-rose-500/50 outline-none w-52 transition-colors truncate"
          title="Click to rename project"
        />
      </div>

      {/* Center: Aspect Ratio & Mode Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-studio-card p-0.5 rounded-lg border border-studio-border">
          {aspectRatios.map(ar => {
            const Icon = ar.icon;
            const isSelected = currentProject?.aspectRatio === ar.id;
            return (
              <button
                key={ar.id}
                onClick={() => onUpdateProject({ aspectRatio: ar.id })}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-studio-hover'
                }`}
              >
                <Icon className="text-[11px]" />
                <span>{ar.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active AI Agent Indicator Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] text-amber-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Claude Orchestrator Active</span>
        </div>
      </div>

      {/* Right: History, Preview & Export */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-slate-400 border border-studio-border rounded-lg p-0.5 bg-studio-card">
          <button 
            className="p-1.5 hover:text-white hover:bg-studio-hover rounded text-xs transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <FaUndo />
          </button>
          <button 
            className="p-1.5 hover:text-white hover:bg-studio-hover rounded text-xs transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <FaRedo />
          </button>
        </div>

        <button
          onClick={onOpenExport}
          disabled={isRendering}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
        >
          <FaDownload className="text-[11px]" />
          <span>{isRendering ? 'Rendering...' : 'Export Video'}</span>
        </button>
      </div>
    </header>
  );
}
