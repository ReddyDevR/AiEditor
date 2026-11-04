import React from 'react';
import { 
  FaComments, FaFilm, FaEye, FaMagic, FaFolderOpen, 
  FaLayerGroup, FaPhotoVideo, FaHistory, FaCog, FaPlus 
} from 'react-icons/fa';

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  projects = [], 
  currentProjectId, 
  onSelectProject, 
  onCreateProject 
}) {
  const mainNav = [
    { id: 'studio', label: 'AI Studio Workspace', icon: FaComments, badge: 'Core' },
    { id: 'editor', label: 'Multi-Track Timeline', icon: FaFilm },
    { id: 'reference', label: 'Reference Style Analyzer', icon: FaEye, badge: 'Viral' },
    { id: 'generate', label: 'AI Video Storyboard', icon: FaMagic, badge: 'New' },
    { id: 'projects', label: 'Projects Hub', icon: FaFolderOpen },
    { id: 'templates', label: 'Templates & Presets', icon: FaLayerGroup },
    { id: 'media', label: 'Media Assets', icon: FaPhotoVideo },
    { id: 'exports', label: 'Export History', icon: FaHistory },
    { id: 'settings', label: 'AI Settings & Engine', icon: FaCog }
  ];

  return (
    <aside className="w-64 border-r border-studio-border bg-studio-sidebar flex flex-col justify-between select-none z-20 shrink-0">
      {/* Top: Navigation Items */}
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* New Project Quick Button */}
        <div>
          <button
            onClick={onCreateProject}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-studio-card hover:bg-studio-hover border border-studio-border hover:border-rose-500/40 text-slate-200 rounded-lg text-xs font-semibold shadow-sm transition-all group"
          >
            <FaPlus className="text-rose-400 group-hover:rotate-90 transition-transform text-[11px]" />
            <span>New Project (కొత్త ప్రాజెక్ట్)</span>
          </button>
        </div>

        {/* Main Views */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5">
            Workspaces
          </div>
          <nav className="space-y-0.5">
            {mainNav.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-studio-card/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`text-sm ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-studio-card text-slate-400 border border-studio-border'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Recent Projects List */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5 flex items-center justify-between">
            <span>Recent Projects</span>
            <span className="text-[10px] text-slate-400 font-mono">{projects.length}</span>
          </div>
          <div className="space-y-1">
            {projects.map(p => {
              const isSelected = p.id === currentProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    if (activeView === 'landing' || activeView === 'projects') {
                      setActiveView('studio');
                    }
                  }}
                  className={`px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-studio-card border-rose-500/40 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-studio-card/50'
                  }`}
                >
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                    <span className="uppercase">{p.aspectRatio}</span>
                    <span>•</span>
                    <span>{p.duration}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: System Engine Status */}
      <div className="p-3 border-t border-studio-border bg-[#0a0d14]">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">Local FFmpeg 9.0</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            Free Offline
          </span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">
          Telugu & English NLP Engine Ready
        </div>
      </div>
    </aside>
  );
}
