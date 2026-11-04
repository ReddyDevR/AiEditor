import React from 'react';
import { 
  FaMobileAlt, FaDesktop, FaBolt, FaFilm, 
  FaMicrophone, FaFire, FaCheck 
} from 'react-icons/fa';

export default function TemplatePicker({ onApplyTemplate }) {
  const templates = [
    {
      id: 'telugu_cinema',
      title: 'Telugu Cinema Promo (మాస్ టీజర్)',
      aspectRatio: '9:16',
      badge: 'Trending Telugu',
      icon: FaFire,
      description: 'High-energy mass beat cuts, dramatic slow motion, bold Telugu captions, and high-impact bass drops.',
      settings: {
        aspectRatio: '9:16',
        filter: 'teal_orange',
        subtitles: [
          { start: 0.5, duration: 3.5, text: 'ఇది మామూలు సినిమా కాదు! 🔥', style: 'hormozi' },
          { start: 4.2, duration: 4.0, text: 'థియేటర్లలో రచ్చ లేపే మాస్ కంటెంట్! 💥', style: 'hormozi' }
        ]
      }
    },
    {
      id: 'viral_reel',
      title: 'Viral Instagram Reel (Hormozi Style)',
      aspectRatio: '9:16',
      badge: 'High Retention',
      icon: FaMobileAlt,
      description: 'Dynamic kinetic yellow captions, silent gaps removed, punchy zoom-ins, and upbeat background music ducking.',
      settings: {
        aspectRatio: '9:16',
        filter: 'clean_vibrant',
        subtitles: [
          { start: 0.5, duration: 3.0, text: 'Stop doing this mistake! ❌', style: 'hormozi' },
          { start: 3.8, duration: 3.5, text: 'Here is the 3-step secret to scale 🚀', style: 'hormozi' }
        ]
      }
    },
    {
      id: 'tech_vlog',
      title: 'YouTube 4K Tech & Travel Vlog',
      aspectRatio: '16:9',
      badge: 'Cinematic Widescreen',
      icon: FaDesktop,
      description: 'Moody warm film color grading, wide establishing shots, gentle crossfades, and subtle lower-third titles.',
      settings: {
        aspectRatio: '16:9',
        filter: 'moody_warm',
        subtitles: [
          { start: 1.0, duration: 5.0, text: 'Exploring Araku Valley in 4K Cinema 🌿', style: 'cinema_classic' }
        ]
      }
    },
    {
      id: 'podcast_clip',
      title: 'Podcast Viral Snippet',
      aspectRatio: '9:16',
      badge: 'Podcast Hook',
      icon: FaMicrophone,
      description: 'Word-by-word highlighted captions, speech enhancement, background noise suppression, and auto silence trim.',
      settings: {
        aspectRatio: '9:16',
        filter: 'teal_orange',
        subtitles: [
          { start: 0.5, duration: 4.0, text: 'This single mindset changed everything 🎙️', style: 'hormozi' }
        ]
      }
    }
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#090b10] space-y-6">
      <div>
        <h2 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <span>Editing Templates & Presets Library</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Kickstart your edit with pre-engineered multi-track timelines tailored for Telugu Reels, YouTube videos, and Shorts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tmpl => {
          const Icon = tmpl.icon;
          return (
            <div 
              key={tmpl.id}
              className="p-5 bg-studio-card border border-studio-border hover:border-rose-500/40 rounded-2xl space-y-4 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center text-lg border border-rose-500/25 group-hover:scale-105 transition-transform">
                    <Icon />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {tmpl.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>{tmpl.aspectRatio}</span>
                      <span>•</span>
                      <span className="text-amber-400">{tmpl.badge}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="pt-2 border-t border-studio-border flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Includes Audio + Color + Captions
                </span>

                <button
                  onClick={() => onApplyTemplate(tmpl)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-semibold transition-all"
                >
                  <FaCheck className="text-[10px]" />
                  <span>Apply Template</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
