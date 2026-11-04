import React, { useState } from 'react';
import { 
  FaPlus, FaFolder, FaCopy, FaTrash, FaPlay, 
  FaMobileAlt, FaDesktop, FaSquare, FaCalendarAlt 
} from 'react-icons/fa';

export default function ProjectsDashboard({ 
  projects = [], 
  onSelectProject, 
  onCreateProject, 
  onDuplicateProject, 
  onDeleteProject 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAspectRatio, setNewAspectRatio] = useState('9:16');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateProject({ title: newTitle, aspectRatio: newAspectRatio });
    setNewTitle('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#090b10] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-extrabold text-white">
            Projects Dashboard (ప్రాజెక్ట్‌లు)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your AI editing workspaces, duplicated branches, and exports.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20"
        >
          <FaPlus className="text-xs" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map(p => {
          const isReel = p.aspectRatio === '9:16';
          return (
            <div 
              key={p.id}
              className="p-5 bg-studio-card border border-studio-border hover:border-rose-500/40 rounded-2xl space-y-4 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-studio-sidebar border border-studio-border flex items-center justify-center text-rose-400 text-sm">
                      {isReel ? <FaMobileAlt /> : <FaDesktop />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors truncate max-w-[180px]">
                        {p.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="uppercase text-amber-400 font-bold">{p.aspectRatio}</span>
                        <span>•</span>
                        <span>{p.duration}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2">
                  {p.conversation?.[0]?.text || 'Natural language AI video project.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-studio-border flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onDuplicateProject?.(p.id)}
                    className="p-2 text-slate-400 hover:text-white rounded hover:bg-studio-hover transition-colors"
                    title="Duplicate Project"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                  <button
                    onClick={() => onDeleteProject?.(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded hover:bg-studio-hover transition-colors"
                    title="Delete Project"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectProject(p.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <FaPlay className="text-[10px]" />
                  <span>Open Editor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1017] border border-studio-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create New Project</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hyderabad Street Food Reel (తెలుగు)"
                  className="w-full bg-studio-card border border-studio-border rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '9:16', label: '9:16 Reel' },
                    { id: '16:9', label: '16:9 Cinema' },
                    { id: '1:1', label: '1:1 Square' }
                  ].map(ar => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setNewAspectRatio(ar.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        newAspectRatio === ar.id
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-studio-card border-studio-border text-slate-400'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl disabled:opacity-40"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
