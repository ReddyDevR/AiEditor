# 🎬 REDDY AI STUDIO
### Autonomous AI-Powered Video Editing & Video Generation Web Application

![REDDY AI STUDIO](https://img.shields.io/badge/Platform-REDDY%20AI%20STUDIO-rose?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-Local%20FFmpeg%209.0-emerald?style=for-the-badge)
![AI](https://img.shields.io/badge/Intelligence-Claude%20Style%20Telugu%20%26%20English%20NLP-amber?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-blue?style=for-the-badge)

---

## 🌟 Executive Overview

**REDDY AI STUDIO** is a world-class, production-ready AI video production platform that combines the reasoning, conversational depth, and contextual memory of **Claude AI** with the raw processing power of a professional video editing suite.

Unlike static prototypes or chatbot mockups, **REDDY AI STUDIO** performs **real video processing** using local **FFmpeg 9.0 full build**, executes frame-accurate trims, removes silences with jump cuts, applies cinematic color curves (LUTs), generates animated Telugu and English captions, and renders downloadable 1080p and 4K MP4 exports.

---

## 🚀 Key Highlights & Capabilities

### 1. 🧠 Claude-Style Conversational Interface & Multilingual NLP
- **Native Telugu Script Support**: e.g., *"ఈ వీడియోలో అనవసరమైన భాగాలు తొలగించి సినిమాటిక్ కలర్ గ్రేడింగ్ చేయండి"*.
- **Romanized Telugu ("Manglish") Comprehension**: e.g., *"Ee video ni 9:16 Instagram Reel ga marchi, Telugu lo stylish subtitles add cheyyandi. Unnecessary silent gaps theeseseyyi"*.
- **Natural English Creative Prompts**: e.g., *"Make this video cinematic with Teal & Orange grade, sync cuts to the beats, and remove the last 5 seconds"*.
- **Conversational Revisions**: In-context memory for iterative modifications (*"Make the subtitles bigger"*, *"Reduce background music"*, *"Change to 9:16"*).

### 2. 🤖 Autonomous Multi-Agent Swarm
A central AI orchestrator coordinates specialized agents:
- **AspectRatioAgent**: Converts aspect ratios to 9:16 (Vertical Reels/Shorts with blurred pillarbox), 16:9 (Cinema), or 1:1 (Square).
- **CuttingAndTrimmingAgent**: Detects silences, performs jump cuts, trims dead air, and removes specified durations.
- **ColourGradingAgent**: Applies Teal & Orange, Moody Warm, Neon Cyberpunk, Vintage Retro, and Film Noir curves.
- **SubtitleAgent**: Synthesizes and burns synchronized Hormozi-style yellow captions with drop shadows.
- **AudioProcessingAgent**: Mixes background music, performs speech ducking (dropping BGM by 80% during vocals).
- **TransitionsAgent**: Adds crossfades, whip zooms, and syncs cuts to musical tempo (BPM).
- **VisualEffectsAgent**: Applies slow-motion ramps (0.5x, 0.75x) to highlight sections.
- **ThumbnailAgent**: Captures high-contrast frames and generates social-ready thumbnails.
- **FinalRenderingAgent**: Dispatches FFmpeg jobs with live progress callbacks (0% to 100%).

### 3. 🔍 Reference Reel & Style Analyzer
- Upload any reference video or paste a public Reel / Shorts URL.
- Extracts an **Editing Blueprint**:
  - Pacing & Scene Duration (e.g., 1.8s average scene length)
  - Cut Frequency (e.g., 34 cuts per minute)
  - Color Grading Palette & Dominant Tones
  - Subtitle Typography & Safe Zone Placement
  - Audio Dynamics & Beat Drops
- **1-Click Blueprint Application**: Automatically ports the blueprint styling directly to the user's footage!

### 4. 🎨 AI Storyboard & Text-to-Video Workflow
- Generate multi-scene cinematic storyboards from textual descriptions.
- Previews camera angles, volumetric lighting, and audio cues for each shot.
- Assembles and renders completed stitched video compositions.

### 5. 🎞️ Multi-Track Video Timeline Editor
- Video, Audio/BGM, Subtitle, and Effects tracks.
- Frame-accurate playhead scrub synced with the live video player.
- Split clip at playhead, trim handles, delete clip, track solo/mute.
- Bi-directional synchronization: AI chat instructions adjust the timeline, and manual user timeline edits update project state.

---

## 🛠️ Technology Architecture

```
reddy-ai-studio/
├── backend/
│   ├── bin/
│   │   ├── ffmpeg.exe           # Local FFmpeg 9.0 Full (x264, x265, libass, aac)
│   │   └── ffprobe.exe          # Local FFprobe metadata extractor
│   ├── src/
│   │   ├── agents/
│   │   │   ├── orchestrator.js  # Central multi-agent orchestrator
│   │   │   └── teluguNlp.js     # Multilingual Telugu & English NLP engine
│   │   ├── database/
│   │   │   └── jsonStore.js     # Persistent atomic project & asset store
│   │   ├── routes/
│   │   │   ├── chatRoutes.js    # Claude chat & plan approval endpoints
│   │   │   ├── projectRoutes.js # Project CRUD & timeline autosave
│   │   │   ├── mediaRoutes.js   # Video upload, probe & sample generation
│   │   │   ├── renderRoutes.js  # Render queue, SSE live progress & MP4 download
│   │   │   ├── referenceRoutes.js # Style analyzer & blueprint extraction
│   │   │   ├── generateRoutes.js  # AI storyboard & generation
│   │   │   └── settingsRoutes.js  # Health & AI provider keys
│   │   ├── services/
│   │   │   ├── ffmpegService.js # High-performance FFmpeg rendering engine
│   │   │   └── aiVideoGenService.js # Storyboard generator
│   │   └── server.js            # Express server (APIs + Static Frontend)
│   └── python_worker/
│       ├── speech_worker.py     # Multilingual SpeechRecognition & TTS
│       └── style_extractor.py   # Visual style & cut metrics extraction
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   ├── chat/            # ClaudeChat & PlanViewer
│   │   │   ├── editor/          # VideoPlayer & MultiTrackTimeline
│   │   │   ├── reference/       # StyleAnalyzer
│   │   │   ├── generate/        # AiVideoGen
│   │   │   ├── templates/       # TemplatePicker
│   │   │   └── export/          # ExportModal
│   │   ├── pages/               # LandingPage, StudioWorkspace, ProjectsDashboard, Settings
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── start.bat                    # 1-Click Windows Batch Launcher
├── start.ps1                    # 1-Click PowerShell Launcher
└── README.md
```

---

## ⚡ Quick Start & Execution

### Option A: 1-Click Start (Windows Batch)
Double-click `start.bat` or run:
```cmd
start.bat
```

### Option B: PowerShell Launch
```powershell
.\start.ps1
```

Once started, open your web browser at:
👉 **`http://localhost:5050`**

---

## 📡 API Reference & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health and uptime status |
| `GET` | `/api/projects` | List all user projects |
| `POST` | `/api/projects` | Create a new project |
| `PUT` | `/api/projects/:id` | Autosave timeline tracks and clips |
| `POST` | `/api/chat/message` | Submit instruction in Telugu / English |
| `POST` | `/api/chat/approve-plan` | Approve AI editing plan and apply to timeline |
| `POST` | `/api/media/upload` | Upload MP4/MOV/WebM video with metadata probe |
| `POST` | `/api/media/generate-sample`| Generate crisp test video via FFmpeg |
| `POST` | `/api/render/start` | Submit render job (9:16, 16:9, 1:1, 1080p, 4K) |
| `GET` | `/api/render/events/:jobId` | Server-Sent Events (SSE) live rendering progress |
| `GET` | `/api/render/download/:jobId`| Download master MP4 video file |
| `POST` | `/api/reference/analyze` | Extract editing blueprint from video/URL |
| `POST` | `/api/reference/apply-to-project`| Apply blueprint style to project |
| `POST` | `/api/generate/storyboard` | Generate 4-scene narrative storyboard |
| `GET` | `/api/settings/status` | FFmpeg version and storage disk usage |

---

## 💎 Design System & UX
- **Luxury Dark Glassmorphism**: Deep `#090b10` background with glowing rose (`#e11d48`) and amber (`#f59e0b`) accents.
- **Responsive Layout**: Seamless experience on 4K monitors, laptops, and tablets.
- **Zero Mock UI**: Every button, slider, export, and chat message triggers genuine backend logic.
- **Free-First Engineering**: Full functionality runs offline and locally without requiring paid third-party API subscriptions.

---
© 2026 **REDDY AI STUDIO**. Built for creators and editors worldwide.
