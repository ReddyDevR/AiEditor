import React from 'react';
import { 
  FaPlay, FaRobot, FaFilm, FaLanguage, FaBolt, 
  FaMagic, FaEye, FaArrowRight, FaCheckCircle, FaDownload 
} from 'react-icons/fa';

export default function LandingPage({ onLaunchStudio }) {
  const features = [
    {
      icon: FaRobot,
      title: 'Claude-Level Conversational Editing',
      desc: 'Talk to the AI like a human creative director. Understands Telugu, English, and Roman Telugu mixed instructions.'
    },
    {
      icon: FaFilm,
      title: 'Autonomous Multi-Agent Swarm',
      desc: 'Dedicated specialized agents for cutting, silence removal, color grading, subtitles, transitions, and aspect ratio conversion.'
    },
    {
      icon: FaLanguage,
      title: 'Native Telugu Subtitles & Voice',
      desc: 'High-energy Hormozi style animated captions in Telugu script or English with automatic speech synchronization.'
    },
    {
      icon: FaEye,
      title: 'Reference Style & Reel Cloner',
      desc: 'Upload reference videos or paste Reel links to extract cut frequency, color palettes, and pacing blueprints.'
    },
    {
      icon: FaBolt,
      title: 'Local Real FFmpeg Rendering',
      desc: 'Powered by local FFmpeg 9.0 full build. Generates real downloadable 1080p and 4K MP4 exports with zero API cost.'
    },
    {
      icon: FaMagic,
      title: 'AI Storyboards & Text-to-Video',
      desc: 'Design multi-scene narrative shot sequences, camera motions, and render full video compositions.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#090b10] text-slate-100 select-none">
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
          <FaBolt className="text-[10px]" />
          <span>Next-Gen Autonomous AI Video Production Studio</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
          Video Editing at the Speed of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500">
            Natural Conversation.
          </span>
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          REDDY AI STUDIO combines the intelligence and contextual reasoning of Claude AI with a professional 
          multi-track video editing engine. Speak Telugu, English, or Telugu Roman words — the AI orchestrates real FFmpeg cuts, 
          cinematic grading, and animated subtitles.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={onLaunchStudio}
            className="flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-bold rounded-xl text-sm shadow-xl shadow-rose-500/30 active:scale-95 transition-all group"
          >
            <FaPlay className="text-xs group-hover:translate-x-0.5 transition-transform" />
            <span>Launch Studio Workspace (స్టూడియో ప్రారంభించండి)</span>
          </button>
        </div>

        {/* Live Prompt Example Card */}
        <div className="pt-8 max-w-2xl mx-auto">
          <div className="p-4 bg-studio-card/80 backdrop-blur-xl border border-studio-border rounded-2xl text-left space-y-3 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
              <span className="font-mono text-[11px] text-rose-400">Natural Language Prompt:</span>
              <span className="text-[10px] bg-studio-sidebar px-2 py-0.5 rounded text-amber-400 font-mono">Telugu-English</span>
            </div>
            <div className="text-sm text-slate-200 font-mono">
              "Ee video ni 9:16 Instagram Reel ga chesi, Telugu lo stylish subtitles add cheyyandi. Unnecessary silent gaps theeseseyyi and Teal & Orange colour grading ivvu."
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-emerald-400 font-medium">
              <span className="flex items-center space-x-1">
                <FaCheckCircle className="text-xs" />
                <span>Auto-plan generated • 4 specialized agents coordinated • Real 1080p MP4 ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-12 border-t border-studio-border">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-white">
            Engineered for Creators, Filmmakers & Editors
          </h2>
          <p className="text-xs text-slate-400">
            Real software running local FFmpeg pipelines. No fake placeholders, no mock progress bars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i}
                className="p-5 bg-studio-card border border-studio-border hover:border-rose-500/40 rounded-2xl space-y-3 transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center text-lg border border-rose-500/25">
                  <Icon />
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
