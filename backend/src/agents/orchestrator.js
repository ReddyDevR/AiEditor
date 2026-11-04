/**
 * REDDY AI STUDIO - Autonomous Multi-Agent Orchestrator
 * Central intelligence engine coordinating specialized agents:
 * - Video Analysis Agent
 * - Scene Detection Agent
 * - Clip Selection Agent
 * - Cutting & Trimming Agent
 * - Subtitle Agent (Telugu & English)
 * - Audio & BGM Processing Agent
 * - Transitions Agent
 * - Visual Effects Agent
 * - Colour Grading Agent
 * - Aspect Ratio Conversion Agent
 * - Thumbnail Generation Agent
 * - Final Rendering Agent
 */

const { TeluguNlpAgent } = require('./teluguNlp');
const { ffmpegService } = require('../services/ffmpegService');
const path = require('path');
const fs = require('fs');

class AgentOrchestrator {
  constructor() {
    this.nlp = new TeluguNlpAgent();
  }

  /**
   * Process a conversational user prompt in Telugu, English, or Telugu-English
   * against the current project context and generate a validated editing plan.
   */
  async processInstruction(prompt, project, conversationHistory = []) {
    console.log(`[AgentOrchestrator] Processing instruction: "${prompt}" for project: ${project?.id || 'new'}`);

    // 1. Natural Language & Intent Analysis
    const nlpResult = this.nlp.analyze(prompt, {
      aspectRatio: project?.aspectRatio || '9:16',
      duration: project?.duration || 15
    });

    const operations = nlpResult.operations;
    const detectedLanguage = nlpResult.detectedLanguage;
    const detectedAspectRatio = nlpResult.detectedAspectRatio;

    // 2. Multi-Agent Delegation & Plan Structuring
    const structuredPlan = {
      id: `plan_${Date.now()}`,
      title: this.generatePlanTitle(prompt, detectedLanguage),
      aspectRatio: detectedAspectRatio,
      language: detectedLanguage,
      confidence: nlpResult.confidenceScore,
      createdAt: new Date().toISOString(),
      status: 'pending_approval',
      steps: []
    };

    // Agent 1: Aspect Ratio Conversion Agent
    const aspectOp = operations.find(o => o.type === 'SET_ASPECT_RATIO');
    if (aspectOp) {
      structuredPlan.steps.push({
        agent: 'AspectRatioAgent',
        type: 'SET_ASPECT_RATIO',
        title: `Format to ${aspectOp.aspectRatio}`,
        description: aspectOp.description,
        targetWidth: aspectOp.targetWidth,
        targetHeight: aspectOp.targetHeight,
        status: 'planned'
      });
    }

    // Agent 2: Scene Detection & Silence Cutting Agent
    const silenceOp = operations.find(o => o.type === 'REMOVE_SILENCE');
    if (silenceOp) {
      structuredPlan.steps.push({
        agent: 'CuttingAndTrimmingAgent',
        type: 'REMOVE_SILENCE',
        title: 'Auto Silence Removal & Jump Cuts',
        description: silenceOp.description,
        thresholdDb: silenceOp.thresholdDb,
        minDurationSec: silenceOp.minDurationSec,
        status: 'planned'
      });
    }

    // Agent 3: Timeline Trimming Agent (specific seconds)
    const trimOp = operations.find(o => o.type === 'TRIM_TIMELINE');
    if (trimOp) {
      structuredPlan.steps.push({
        agent: 'CuttingAndTrimmingAgent',
        type: 'TRIM_TIMELINE',
        title: `Trim ${trimOp.position === 'end' ? 'Ending' : 'Beginning'}`,
        description: trimOp.description,
        position: trimOp.position,
        duration: trimOp.duration,
        status: 'planned'
      });
    }

    // Agent 4: Colour Grading Agent
    const colorOp = operations.find(o => o.type === 'APPLY_COLOR_GRADE');
    if (colorOp) {
      structuredPlan.steps.push({
        agent: 'ColourGradingAgent',
        type: 'APPLY_COLOR_GRADE',
        title: `Cinematic Color Grade: ${colorOp.preset.replace('_', ' ').toUpperCase()}`,
        description: colorOp.description,
        preset: colorOp.preset,
        intensity: colorOp.intensity,
        status: 'planned'
      });
    }

    // Agent 5: Subtitle & Typography Agent
    const subOp = operations.find(o => o.type === 'GENERATE_SUBTITLES' || o.type === 'UPDATE_SUBTITLES');
    if (subOp) {
      structuredPlan.steps.push({
        agent: 'SubtitleAgent',
        type: subOp.type,
        title: subOp.type === 'UPDATE_SUBTITLES' ? 'Adjust Subtitle Styling' : 'Generate Multilingual Subtitles',
        description: subOp.description,
        language: subOp.language || (detectedLanguage === 'telugu' ? 'te' : 'en'),
        style: subOp.style || 'hormozi',
        fontSize: subOp.fontSize || 42,
        status: 'planned'
      });
    }

    // Agent 6: Audio Processing & Background Music Agent
    const audioOp = operations.find(o => o.type === 'ADD_BACKGROUND_MUSIC' || o.type === 'ADJUST_AUDIO_LEVELS');
    if (audioOp) {
      structuredPlan.steps.push({
        agent: 'AudioProcessingAgent',
        type: audioOp.type,
        title: audioOp.type === 'ADJUST_AUDIO_LEVELS' ? 'Adjust Audio Balance' : 'Mix Background Music & Ducking',
        description: audioOp.description,
        bgmVolume: audioOp.bgmVolume,
        ducking: audioOp.ducking,
        status: 'planned'
      });
    }

    // Agent 7: Visual Effects & Speed Ramping Agent
    const speedOp = operations.find(o => o.type === 'APPLY_SPEED_EFFECT');
    if (speedOp) {
      structuredPlan.steps.push({
        agent: 'VisualEffectsAgent',
        type: 'APPLY_SPEED_EFFECT',
        title: 'Cinematic Slow Motion',
        description: speedOp.description,
        factor: speedOp.speedFactor,
        status: 'planned'
      });
    }

    // Agent 8: Transitions Agent
    const transOp = operations.find(o => o.type === 'APPLY_TRANSITIONS' || o.type === 'SYNC_BEAT_CUTS');
    if (transOp) {
      structuredPlan.steps.push({
        agent: 'TransitionsAgent',
        type: transOp.type,
        title: transOp.type === 'SYNC_BEAT_CUTS' ? 'Beat-Synchronized Cuts' : 'Smooth Dynamic Transitions',
        description: transOp.description,
        transitionType: transOp.transitionType || 'crossfade_zoom',
        status: 'planned'
      });
    }

    // Agent 9: Thumbnail Generation Agent
    structuredPlan.steps.push({
      agent: 'ThumbnailAgent',
      type: 'GENERATE_THUMBNAIL',
      title: 'High-Impact Video Thumbnail',
      description: 'Capture highest visual contrast frame and generate social-ready thumbnail',
      status: 'planned'
    });

    // Final Agent: Render Agent
    structuredPlan.steps.push({
      agent: 'FinalRenderingAgent',
      type: 'RENDER_EXPORT',
      title: 'Real MP4 Video Render & Encode',
      description: `Output frame-accurate MP4 in ${structuredPlan.aspectRatio} with AAC audio`,
      status: 'planned'
    });

    // Formulate Claude-Style Conversational Response
    const conversationalText = this.buildClaudeStyleResponse(
      prompt,
      nlpResult,
      structuredPlan,
      project
    );

    return {
      success: true,
      conversationalResponse: conversationalText,
      plan: structuredPlan,
      detectedLanguage: detectedLanguage,
      detectedAspectRatio: detectedAspectRatio,
      operations: operations
    };
  }

  generatePlanTitle(prompt, language) {
    if (language === 'telugu') return 'తెలుగు రీల్ & సినిమాటిక్ ఎడిటింగ్ ప్లాన్';
    if (language === 'telugu-english') return 'Reel & Cinematic Video Editing Plan';
    if (prompt.toLowerCase().includes('reel')) return 'Viral Instagram Reel Optimization Plan';
    if (prompt.toLowerCase().includes('cinematic')) return 'Cinematic Color & Beat-Sync Plan';
    return 'Reddy AI Studio Autonomous Editing Plan';
  }

  buildClaudeStyleResponse(prompt, nlpResult, plan, project) {
    const lang = nlpResult.detectedLanguage;
    const stepsSummary = plan.steps.map((s, idx) => `${idx + 1}. **${s.title}** (${s.agent}): ${s.description}`).join('\n');

    if (lang === 'telugu') {
      return `నమస్కారం! మీ సూచనలను నేను విశ్లేషించాను. మీ ప్రాజెక్ట్ కోసం నేను కింది ఎడిటింగ్ ప్లాన్ సిద్ధం చేశాను:\n\n${stepsSummary}\n\nఈ మార్పులను వెంటనే ఎగ్జిక్యూట్ చేసి వీడియో రెండర్ చేయమంటారా? లేక కలర్స్ లేదా సబ్‌టైటిల్స్ సైజులో ఏవైనా సవరణలు చేయమంటారా?`;
    } else if (lang === 'telugu-english') {
      return `Namaskaram! Meeru adigina "${prompt}" instructions ni Reddy AI Agent analyze chesindi. Meekosam prepare chesina editing plan idi:\n\n${stepsSummary}\n\nEe plan meeku perfectly set aithe kindunna **"Approve & Execute"** button click cheyyandi, ventane real video process chesi chupisthanu!`;
    } else {
      return `I've analyzed your instructions: *"{{PROMPT}}"* and designed a multi-step editing workflow for your project.

### Structured Editing Blueprint:
${stepsSummary}

I've ensured aspect ratio constraints, color calibration curves, and subtitle typography are optimized. Would you like me to proceed with execution, or do you have any specific revisions to the timeline?`.replace('{{PROMPT}}', prompt);
    }
  }

  /**
   * Applies an approved editing plan to the project timeline state
   */
  applyPlanToTimeline(project, plan) {
    const updated = JSON.parse(JSON.stringify(project));
    updated.aspectRatio = plan.aspectRatio || updated.aspectRatio || '9:16';

    const colorStep = plan.steps.find(s => s.type === 'APPLY_COLOR_GRADE');
    const trimStep = plan.steps.find(s => s.type === 'TRIM_TIMELINE');
    const subStep = plan.steps.find(s => s.type === 'GENERATE_SUBTITLES' || s.type === 'UPDATE_SUBTITLES');
    const speedStep = plan.steps.find(s => s.type === 'APPLY_SPEED_EFFECT');

    // Update video tracks
    const videoTrack = updated.timeline?.tracks?.find(t => t.type === 'video');
    if (videoTrack && videoTrack.clips) {
      videoTrack.clips.forEach(clip => {
        if (colorStep) clip.filter = colorStep.preset;
        if (speedStep) clip.speed = speedStep.factor;
      });

      if (trimStep && trimStep.position === 'end') {
        const lastClip = videoTrack.clips[videoTrack.clips.length - 1];
        if (lastClip) {
          lastClip.duration = Math.max(2, lastClip.duration - (trimStep.duration || 5));
        }
      }
    }

    // Update or add subtitle track
    if (subStep && updated.timeline?.tracks) {
      let subTrack = updated.timeline.tracks.find(t => t.type === 'subtitles');
      if (!subTrack) {
        subTrack = { id: `track-sub-${Date.now()}`, type: 'subtitles', name: 'AI Subtitles', clips: [] };
        updated.timeline.tracks.push(subTrack);
      }
      if (subStep.type === 'UPDATE_SUBTITLES') {
        subTrack.clips.forEach(c => {
          c.fontSize = (c.fontSize || 36) + (subStep.fontSizeDelta || 8);
        });
      }
    }

    // Recalculate duration
    const totalDur = (videoTrack?.clips || []).reduce((acc, c) => acc + (c.duration || 0), 0);
    updated.duration = Math.max(5, Math.round(totalDur * 10) / 10);
    updated.status = 'ready';

    return updated;
  }
}

const agentOrchestrator = new AgentOrchestrator();

module.exports = {
  AgentOrchestrator,
  agentOrchestrator
};
