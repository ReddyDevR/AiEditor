import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Sparkles, Film, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AutonomousEditor() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('Ee video ni professional cinematic style lo edit cheyyi. Unnecessary beginning and ending remove cheyyi, best moments ni highlight cheyyi, natural color grading apply cheyyi. Instagram Reel kosam 9:16 format lo export cheyyi.');
  const [job, setJob] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!job?.id || ['completed', 'failed'].includes(job.status)) return;
    const timer = setInterval(async () => {
      try { const r = await fetch(`/api/autonomous/status/${job.id}`); const d = await r.json(); if (d.success) setJob(d.job); }
      catch (_) { /* transient network issue; continue polling */ }
    }, 2500);
    return () => clearInterval(timer);
  }, [job?.id, job?.status]);
  const start = async (e) => {
    e.preventDefault();
    if (!file || !prompt.trim() || busy) return;
    setBusy(true); setJob({ status: 'processing', progress: 1, message: 'Video upload avutondi...' });
    try {
      const body = new FormData(); body.append('video', file); body.append('prompt', prompt);
      const response = await fetch('/api/autonomous/start', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Job start kaaledu');
      setJob(data.job);
    } catch (err) { setJob({ status: 'failed', message: err.message, error: err.message }); }
    finally { setBusy(false); }
  };
  const running = job && !['completed', 'failed'].includes(job.status);
  return <div className="flex-1 overflow-y-auto bg-[#090b10] p-5 md:p-10">
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-400"><Sparkles size={28}/></div><h1 className="text-3xl font-bold text-white md:text-4xl">REDDY AI STUDIO</h1><p className="mt-2 text-slate-400">Upload your video. Tell AI what you want. AI analyzes the video and completes the editing automatically. You only upload and describe the result you want.</p></div>
      <form onSubmit={start} className="space-y-5 rounded-2xl border border-white/10 bg-[#111722] p-5 md:p-7">
        <div><label className="mb-2 block text-sm font-semibold text-slate-200">1. Upload your video</label><input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/><button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/60 p-5 text-center hover:border-red-400"><UploadCloud size={30} className="mb-2 text-red-400"/><span className="font-medium text-white">{file ? file.name : 'Click to upload or choose a video'}</span><span className="mt-1 text-xs text-slate-500">MP4, MOV, WebM, MKV, AVI · Limit {Number(import.meta.env.VITE_MAX_UPLOAD_MB || 100)} MB</span></button></div>
        <div><label className="mb-2 block text-sm font-semibold text-slate-200">2. Describe how you want the final video</label><textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} placeholder="Example: Make a cinematic Telugu reel, remove unwanted parts, add subtitles and background music..." className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-white outline-none focus:border-red-400"/></div>
        <button disabled={!file || !prompt.trim() || busy || running} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles size={19}/>{running ? 'AI IS EDITING...' : 'START AUTOMATIC AI EDITING'}</button>
      </form>
      {job && <section className="mt-5 rounded-2xl border border-white/10 bg-[#111722] p-5">
        <div className="flex items-center gap-3">{job.status === 'completed' ? <CheckCircle2 className="text-emerald-400"/> : job.status === 'failed' ? <AlertCircle className="text-red-400"/> : <Loader2 className="animate-spin text-red-400"/>}<div><h2 className="font-semibold text-white">{job.status === 'completed' ? 'Your edited video is ready' : job.status === 'failed' ? 'Editing failed' : 'AI is working on your video'}</h2><p className="text-sm text-slate-400">{job.message}</p>{job.aiSummary && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{job.aiSummary}</p>}</div></div>
        {job.status !== 'failed' && <><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-red-500 transition-all" style={{width:`${job.progress || 0}%`}}/></div><p className="mt-2 text-right text-xs text-slate-400">{job.progress || 0}%</p></>}
        {job.status === 'completed' && job.outputUrl && <div className="mt-5 space-y-4"><video controls playsInline src={job.outputUrl} className="max-h-[520px] w-full rounded-xl bg-black"/><a href={job.outputUrl} target="_blank" rel="noreferrer" download className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-500"><Download size={18}/> Download Final Video</a></div>}
        {job.error && <p className="mt-3 text-sm text-red-300">{job.error}</p>}
      </section>}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-400/5 p-4 text-xs leading-5 text-slate-400"><Film size={18} className="mt-0.5 shrink-0 text-blue-300"/><p>Editing automatic ga jarugutundi. User timeline, clips, subtitles, transitions ni manual ga edit cheyyalsina avasaram ledu. Processing kosam backend lo FFmpeg and configured AI services avasaram.</p></div>
    </div>
  </div>;
}
