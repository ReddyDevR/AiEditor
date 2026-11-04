import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LandingPage from './pages/LandingPage';
import StudioWorkspace from './pages/StudioWorkspace';
import ProjectsDashboard from './pages/ProjectsDashboard';
import SettingsPage from './pages/SettingsPage';
import StyleAnalyzer from './components/reference/StyleAnalyzer';
import AiVideoGen from './components/generate/AiVideoGen';
import TemplatePicker from './components/templates/TemplatePicker';
import ExportModal from './components/export/ExportModal';
import MultiTrackTimeline from './components/editor/MultiTrackTimeline';

export default function App() {
  const [activeView, setActiveView] = useState('studio');
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  // Load initial projects from backend
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.projects?.length > 0) {
          setProjects(data.projects);
          setCurrentProjectId(data.projects[0].id);
        }
      })
      .catch(err => console.warn('Could not load projects:', err));
  }, []);

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0] || null;

  // Update project in state and persist to backend
  const handleUpdateProject = async (updates) => {
    if (!currentProject) return;
    const updated = { ...currentProject, ...updates };

    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));

    try {
      await fetch(`/api/projects/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('Autosave error:', e);
    }
  };

  // Create new project
  const handleCreateProject = async (params = {}) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProjects(prev => [data.project, ...prev]);
        setCurrentProjectId(data.project.id);
        setActiveView('studio');
      }
    } catch (e) {
      console.error('Project creation failed:', e);
    }
  };

  // Duplicate project
  const handleDuplicateProject = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => [data.project, ...prev]);
        setCurrentProjectId(data.project.id);
      }
    } catch (e) {
      console.error('Duplicate failed:', e);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (currentProjectId === id && projects.length > 1) {
          setCurrentProjectId(projects.find(p => p.id !== id)?.id);
        }
      }
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  // Send message to Claude AI Video Assistant
  const handleSendMessage = async (text) => {
    if (!currentProject) return;

    // Optimistically add user message
    const userMsg = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const nextConversation = [...(currentProject.conversation || []), userMsg];
    handleUpdateProject({ conversation: nextConversation });

    setIsThinking(true);
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          message: text,
          history: nextConversation
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg = {
          id: `msg_a_${Date.now()}`,
          role: 'assistant',
          text: data.conversationalResponse,
          plan: data.plan,
          timestamp: new Date().toISOString()
        };

        handleUpdateProject({
          conversation: [...nextConversation, assistantMsg]
        });
        setActivePlan(data.plan);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  // Approve plan and apply changes to timeline
  const handleApprovePlan = async (plan) => {
    if (!currentProject || !plan) return;
    try {
      const res = await fetch('/api/chat/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProject.id,
          plan
        })
      });

      const data = await res.json();
      if (data.success && data.project) {
        setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
        setActivePlan(null);
        // Automatically open export modal to show rendering workflow
        setIsExportOpen(true);
      }
    } catch (err) {
      console.error('Plan approval error:', err);
    }
  };

  // Apply template
  const handleApplyTemplate = (tmpl) => {
    if (!currentProject) return;
    const updated = {
      ...currentProject,
      aspectRatio: tmpl.settings.aspectRatio,
      title: `${currentProject.title} (${tmpl.title.split(' ')[0]})`
    };

    const videoTrack = updated.timeline?.tracks?.find(t => t.type === 'video');
    if (videoTrack?.clips) {
      videoTrack.clips.forEach(c => {
        c.filter = tmpl.settings.filter;
      });
    }

    const subTrack = updated.timeline?.tracks?.find(t => t.type === 'subtitles');
    if (subTrack && tmpl.settings.subtitles) {
      subTrack.clips = tmpl.settings.subtitles.map((s, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        ...s
      }));
    }

    handleUpdateProject(updated);
    setActiveView('studio');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        currentProject={currentProject}
        onUpdateProject={handleUpdateProject}
        onOpenExport={() => setIsExportOpen(true)}
        isRendering={isRendering}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={(id) => setCurrentProjectId(id)}
          onCreateProject={() => handleCreateProject()}
        />

        {/* Dynamic Center Viewport */}
        <main className="flex-1 flex overflow-hidden">
          {activeView === 'landing' && (
            <LandingPage onLaunchStudio={() => setActiveView('studio')} />
          )}

          {activeView === 'studio' && (
            <StudioWorkspace
              currentProject={currentProject}
              onUpdateProject={handleUpdateProject}
              onSendMessage={handleSendMessage}
              onApprovePlan={handleApprovePlan}
              isThinking={isThinking}
              activePlan={activePlan}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {activeView === 'editor' && (
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
              <div className="text-sm font-bold text-white">Full Timeline Editor View</div>
              <MultiTrackTimeline
                project={currentProject}
                currentTime={0}
                onTimeUpdate={() => {}}
                onUpdateTimeline={(tl) => handleUpdateProject({ timeline: { ...currentProject.timeline, ...tl } })}
              />
            </div>
          )}

          {activeView === 'reference' && (
            <StyleAnalyzer
              currentProject={currentProject}
              onApplyBlueprint={(updated) => handleUpdateProject(updated)}
            />
          )}

          {activeView === 'generate' && (
            <AiVideoGen
              onVideoCreated={(media) => {
                alert(`AI Generated Video ready: ${media.originalName}`);
              }}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsDashboard
              projects={projects}
              onSelectProject={(id) => {
                setCurrentProjectId(id);
                setActiveView('studio');
              }}
              onCreateProject={(p) => handleCreateProject(p)}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeView === 'templates' && (
            <TemplatePicker onApplyTemplate={handleApplyTemplate} />
          )}

          {activeView === 'settings' && (
            <SettingsPage />
          )}

          {activeView === 'media' && (
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <h2 className="text-xl font-display font-extrabold text-white">Media Asset Library</h2>
              <p className="text-xs text-slate-400">All uploaded clips, generated samples, and audio assets.</p>
              <div className="p-4 bg-studio-card border border-studio-border rounded-xl text-xs text-slate-300">
                Media files are stored in <span className="font-mono text-amber-300">backend/uploads</span> and rendered in 1080p/4K.
              </div>
            </div>
          )}

          {activeView === 'exports' && (
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <h2 className="text-xl font-display font-extrabold text-white">Export & Download History</h2>
              <p className="text-xs text-slate-400">Previously completed master renders and download links.</p>
              <div className="p-4 bg-studio-card border border-studio-border rounded-xl text-xs text-slate-300">
                Exports are saved in <span className="font-mono text-emerald-400">backend/exports</span> as high-bitrate H.264 MP4s.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
