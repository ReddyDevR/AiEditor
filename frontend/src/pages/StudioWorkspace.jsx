import React, { useState } from 'react';
import ClaudeChat from '../components/chat/ClaudeChat';
import VideoPlayer from '../components/editor/VideoPlayer';
import MultiTrackTimeline from '../components/editor/MultiTrackTimeline';

export default function StudioWorkspace({ 
  currentProject, 
  onUpdateProject, 
  onSendMessage, 
  onApprovePlan, 
  isThinking, 
  activePlan,
  onOpenExport 
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#090b10]">
      {/* Left Column: Claude-Style Conversational AI Assistant */}
      <div className="w-[440px] lg:w-[480px] h-full flex flex-col shrink-0">
        <ClaudeChat
          project={currentProject}
          onSendMessage={onSendMessage}
          onApprovePlan={onApprovePlan}
          isThinking={isThinking}
          activePlan={activePlan}
        />
      </div>

      {/* Right Column: Player & Multi-Track Timeline */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top: Video Player */}
        <div className="flex-1 overflow-hidden">
          <VideoPlayer
            project={currentProject}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>

        {/* Bottom: Multi-Track Timeline */}
        <MultiTrackTimeline
          project={currentProject}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          onUpdateTimeline={(timelineUpdates) => {
            const updated = {
              ...currentProject,
              timeline: {
                ...currentProject.timeline,
                ...timelineUpdates
              }
            };
            onUpdateProject(updated);
          }}
        />
      </div>
    </div>
  );
}
