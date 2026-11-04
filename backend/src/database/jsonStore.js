/**
 * REDDY AI STUDIO - Persistent JSON Database
 * High-performance, zero-setup atomic storage for projects, conversations,
 * media assets, editing plans, and render jobs.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonStore {
  constructor(collectionName, defaultData = []) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.memoryData = this.load(defaultData);
  }

  load(defaultData) {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(raw);
      }
      this.save(defaultData);
      return defaultData;
    } catch (err) {
      console.warn(`[JsonStore] Failed reading ${this.filePath}, falling back to defaults`, err.message);
      return defaultData;
    }
  }

  save(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      this.memoryData = data;
    } catch (err) {
      console.error(`[JsonStore] Failed writing ${this.filePath}`, err);
    }
  }

  findAll() {
    return [...this.memoryData];
  }

  findById(id) {
    return this.memoryData.find(item => item.id === id) || null;
  }

  create(item) {
    const record = {
      id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item,
    };
    this.memoryData.unshift(record);
    this.save(this.memoryData);
    return record;
  }

  update(id, updates) {
    const index = this.memoryData.findIndex(item => item.id === id);
    if (index === -1) return null;
    const updated = {
      ...this.memoryData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memoryData[index] = updated;
    this.save(this.memoryData);
    return updated;
  }

  delete(id) {
    const index = this.memoryData.findIndex(item => item.id === id);
    if (index === -1) return false;
    this.memoryData.splice(index, 1);
    this.save(this.memoryData);
    return true;
  }
}

// Seed default initial projects and templates
const defaultProjects = [
  {
    id: 'proj_telugu_reel_demo',
    title: 'Hyderabad Street Food Reel (తెలుగు రీల్)',
    aspectRatio: '9:16',
    duration: 18.5,
    status: 'ready',
    timeline: {
      tracks: [
        {
          id: 'track-video',
          type: 'video',
          name: 'Main Footage',
          clips: [
            {
              id: 'clip-1',
              title: 'Charminar Chai Intro',
              start: 0,
              duration: 5.5,
              sourceDuration: 8.0,
              color: '#3b82f6',
              speed: 1.0,
              filter: 'teal_orange'
            },
            {
              id: 'clip-2',
              title: 'Irani Samosa Close-up',
              start: 5.5,
              duration: 6.0,
              sourceDuration: 10.0,
              color: '#10b981',
              speed: 0.8,
              filter: 'teal_orange'
            },
            {
              id: 'clip-3',
              title: 'Evening Crowd Montage',
              start: 11.5,
              duration: 7.0,
              sourceDuration: 12.0,
              color: '#8b5cf6',
              speed: 1.2,
              filter: 'teal_orange'
            }
          ]
        },
        {
          id: 'track-audio',
          type: 'audio',
          name: 'Cinematic BGM',
          clips: [
            {
              id: 'audio-1',
              title: 'Upbeat Telugu Beats',
              start: 0,
              duration: 18.5,
              volume: 0.35,
              ducking: true
            }
          ]
        },
        {
          id: 'track-subtitles',
          type: 'subtitles',
          name: 'Telugu Captions',
          clips: [
            { id: 'sub-1', text: 'హైదరాబాద్ బెస్ట్ ఇరానీ చాయ్! ☕', start: 0.5, duration: 4.5, style: 'hormozi' },
            { id: 'sub-2', text: 'వేడి వేడి సమోసాతో కాంబినేషన్ అదిరిపోయింది! 🔥', start: 5.5, duration: 5.5, style: 'hormozi' },
            { id: 'sub-3', text: 'మీరు ఎప్పుడైనా ట్రై చేశారా? కామెంట్ చేయండి! 👇', start: 11.5, duration: 6.5, style: 'hormozi' }
          ]
        }
      ]
    },
    conversation: [
      {
        id: 'msg-1',
        role: 'user',
        text: 'Ee video ni 9:16 Instagram Reel ga chesi, Telugu lo stylish subtitles add cheyyandi. Unnecessary silent gaps theeseseyyi.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-2',
        role: 'assistant',
        text: 'నమస్కారం! నేను మీ వీడియోను పరిశీలించాను. 9:16 వర్టికల్ రీల్ ఫార్మాట్‌కు మార్చి, సైలెంట్ గ్యాప్స్ తొలగించి, హై-ఎనర్జీ తెలుగు సబ్‌టైటిల్స్ సిద్ధం చేశాను.',
        plan: {
          title: 'Telugu Reel Optimization Plan',
          operations: [
            { type: 'SET_ASPECT_RATIO', description: 'Convert to vertical format (9:16)' },
            { type: 'REMOVE_SILENCE', description: 'Trim dead air gaps between speech' },
            { type: 'APPLY_COLOR_GRADE', description: 'Apply Cinematic Teal & Orange grade' },
            { type: 'GENERATE_SUBTITLES', description: 'Add stylish animated Telugu subtitles' }
          ]
        },
        status: 'approved',
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  },
  {
    id: 'proj_cinematic_vlog',
    title: 'Araku Valley Travel Vlog (4K Cinematic)',
    aspectRatio: '16:9',
    duration: 32.0,
    status: 'ready',
    timeline: {
      tracks: [
        {
          id: 'track-video',
          type: 'video',
          name: 'Main Footage',
          clips: [
            { id: 'c-1', title: 'Coffee Plantations Mist', start: 0, duration: 10, color: '#06b6d4', speed: 0.75, filter: 'moody_warm' },
            { id: 'c-2', title: 'Borra Caves Sunlight', start: 10, duration: 12, color: '#f59e0b', speed: 1.0, filter: 'moody_warm' },
            { id: 'c-3', title: 'Tribal Dance Beats', start: 22, duration: 10, color: '#ec4899', speed: 1.0, filter: 'moody_warm' }
          ]
        },
        {
          id: 'track-audio',
          type: 'audio',
          name: 'Flute & Tabla Ambient BGM',
          clips: [
            { id: 'a-1', title: 'Araku Ambient Soundtrack', start: 0, duration: 32, volume: 0.4, ducking: false }
          ]
        },
        {
          id: 'track-subtitles',
          type: 'subtitles',
          name: 'English Subtitles',
          clips: [
            { id: 'sub-v1', text: 'Welcome to the misty mornings of Araku Valley 🌿', start: 1, duration: 8, style: 'cinema_classic' },
            { id: 'sub-v2', text: 'Millions of years old limestone wonders in Borra Caves', start: 11, duration: 9, style: 'cinema_classic' }
          ]
        }
      ]
    },
    conversation: [
      {
        id: 'msg-v1',
        role: 'user',
        text: 'Make this video cinematic with moody warm color grading, 16:9 YouTube aspect ratio, and sync cuts with the music.',
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'msg-v2',
        role: 'assistant',
        text: 'Understood! I have structured a cinematic travel vlog blueprint with 16:9 widescreen letterbox, slow-motion coffee mist opening, and moody warm grade.',
        plan: {
          title: 'Araku Cinematic Vlog Blueprint',
          operations: [
            { type: 'SET_ASPECT_RATIO', description: 'Convert to 16:9 YouTube Widescreen' },
            { type: 'APPLY_COLOR_GRADE', description: 'Apply Moody Warm Film Color Grade' },
            { type: 'APPLY_SPEED_EFFECT', description: '0.75x Cinematic Slow Motion on Intro' },
            { type: 'SYNC_BEAT_CUTS', description: 'Align transitions to tribal drum beats' }
          ]
        },
        status: 'approved',
        timestamp: new Date(Date.now() - 7100000).toISOString()
      }
    ]
  }
];

const projectsStore = new JsonStore('projects', defaultProjects);
const mediaStore = new JsonStore('media', []);
const renderJobsStore = new JsonStore('render_jobs', []);
const referenceAnalysisStore = new JsonStore('reference_analyses', []);
const aiGenerationsStore = new JsonStore('ai_generations', []);

module.exports = {
  projectsStore,
  mediaStore,
  renderJobsStore,
  referenceAnalysisStore,
  aiGenerationsStore
};
