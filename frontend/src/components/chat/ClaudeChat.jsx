import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPaperPlane, FaRobot, FaUser, FaCheck, FaEdit, 
  FaMicrophone, FaLanguage, FaSlidersH, 
  FaSpinner, FaCheckCircle, FaExclamationTriangle 
} from 'react-icons/fa';

export default function ClaudeChat({ 
  project, 
  onSendMessage, 
  onApprovePlan, 
  isThinking, 
  activePlan 
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: '🔥 Telugu Reel', text: 'Ee video ni 9:16 Instagram Reel ga chesi, Telugu lo stylish subtitles add cheyyandi. Unnecessary silent gaps theeseseyyi.' },
    { label: '🎬 Cinematic Look', text: 'Make this video cinematic with Teal & Orange color grade, remove silences, and sync cuts with music.' },
    { label: '⚡ Viral Short', text: 'Create a 30-second viral-style Short with high-contrast cuts and dynamic yellow Hormozi subtitles.' },
    { label: '🔊 Audio Ducking', text: 'Background music add chesi speech ki ducking ivvandi, speech sound clear ga vinapadali.' },
    { label: '✂️ Trim Last 5s', text: 'Remove the last 5 seconds and make subtitles bigger.' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project?.conversation, isThinking]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
  };

  const conversation = project?.conversation || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b10] border-r border-studio-border">
      {/* Top Header: Claude Orchestrator Info */}
      <div className="h-12 border-b border-studio-border px-4 flex items-center justify-between bg-studio-sidebar/50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
            AI
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>Reddy Video Assistant (Claude Intelligence)</span>
              <span className="text-[10px] text-emerald-400">● Live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <FaLanguage className="text-slate-400 text-sm" />
          <span>Telugu • Roman Telugu • English</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-xl shadow-amber-500/5">
              <FaRobot />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Talk to Your AI Video Editor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe how you want your video edited in natural Telugu, English, or Telugu-English. 
                Reddy AI Studio plans the cuts, applies color grading, generates subtitles, and renders the final MP4.
              </p>
            </div>

            <div className="w-full text-left space-y-1.5 pt-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Try these prompts:</div>
              {quickPrompts.slice(0, 3).map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(qp.text)}
                  className="w-full text-left p-2.5 rounded-lg bg-studio-card/80 hover:bg-studio-hover border border-studio-border hover:border-rose-500/40 text-xs text-slate-300 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{qp.text}</span>
                  <span className="text-[10px] text-rose-400 font-bold shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">Use →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
                {isUser ? (
                  <>
                    <span>You</span>
                    <FaUser className="text-[10px]" />
                  </>
                ) : (
                  <>
                    <div className="w-3.5 h-3.5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold">
                      C
                    </div>
                    <span>Claude Video Orchestrator</span>
                  </>
                )}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-tr-none shadow-md' 
                  : 'bg-studio-card border border-studio-border text-slate-200 rounded-tl-none shadow-sm'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans text-[13px]">{msg.text}</div>

                {/* Structured Editing Plan Card (Assistant) */}
                {msg.plan && (
                  <div className="mt-3.5 p-3.5 bg-[#0b0e15] rounded-xl border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-bold text-xs text-amber-300">
                          {msg.plan.title || 'Structured Editing Blueprint'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded border border-amber-500/30">
                        {msg.plan.aspectRatio || '9:16'}
                      </span>
                    </div>

                    {/* Steps breakdown */}
                    <div className="space-y-1.5">
                      {(msg.plan.steps || msg.plan.operations || []).map((step, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start space-x-2 text-[11px] p-2 bg-studio-sidebar/80 rounded-lg border border-white/5"
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-200">
                              {step.title || step.type}
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5">
                              {step.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Approve & Execute Action */}
                    <div className="pt-2 flex items-center space-x-2">
                      <button
                        onClick={() => onApprovePlan(msg.plan)}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        <FaCheck className="text-[11px]" />
                        <span>Approve & Execute Plan (ఎగ్జిక్యూట్ చేయండి)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start space-x-2 text-slate-400 text-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center animate-spin text-xs">
              <FaSpinner />
            </div>
            <div className="p-3 bg-studio-card border border-studio-border rounded-xl text-slate-300 text-xs">
              Analyzing instruction and orchestrating video editing agents...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-studio-border bg-studio-sidebar/40 flex items-center space-x-2 overflow-x-auto select-none">
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Quick:</span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(qp.text)}
            className="shrink-0 px-2.5 py-1 bg-studio-card hover:bg-studio-hover border border-studio-border hover:border-rose-500/30 rounded-full text-[11px] text-slate-300 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Large Natural Language Prompt Input */}
      <div className="p-4 border-t border-studio-border bg-studio-sidebar">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Talk to your video editor in Telugu, English, or Telugu Roman words... (e.g. 'Ee video ni 9:16 Reel ga marchi, cinematic color grading and Telugu subtitles add cheyyi')"
            rows={3}
            className="w-full bg-studio-card border border-studio-border focus:border-rose-500/60 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all pr-20"
          />

          <div className="absolute right-2.5 bottom-3 flex items-center space-x-1.5">
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="p-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-rose-500/30"
              title="Send to Claude Video Orchestrator"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
          <span>Press Enter to send, Shift+Enter for newline</span>
          <span>Reddy AI v2.5 • Context-Aware Memory</span>
        </div>
      </div>
    </div>
  );
}
