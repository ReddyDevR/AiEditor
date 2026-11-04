/**
 * REDDY AI STUDIO - Multilingual Telugu & English NLP Agent
 * Understands Telugu script, Romanized Telugu (Telugu-English / Manglish),
 * and English natural language instructions with intent & entity extraction.
 */

class TeluguNlpAgent {
  constructor() {
    // Romanized Telugu keywords and synonyms
    this.romanTeluguDictionary = {
      cut: ['cut cheyyi', 'cut cheyyandi', 'theesey', 'teesey', 'theeseyyi', 'teeseyi', 'tholisey', 'kattiri', 'teeyi', 'remove cheyyi', 'cut'],
      trim: ['trim cheyyi', 'chinnadi cheyyi', 'short cheyyi', 'koddisepu unchu'],
      subtitles: ['subtitles', 'subtitle', 'captions', 'maatala text', 'text add cheyyi', 'telugu lo raayi', 'telugu lo text', 'peddaga raayi'],
      music: ['bgm', 'background music', 'music', 'paata', 'sound', 'audio', 'paatalu', 'patalu'],
      cinematic: ['cinematic', 'cinema style', 'movie style', 'mass look', 'rich look', 'grand look'],
      reel: ['reel', 'reels', 'instagram reel', 'short', 'shorts', 'youtube short', 'status', 'story', '9:16', 'vertical'],
      vlog: ['vlog', 'youtube video', 'horizontal', 'landscape', '16:9'],
      slowmo: ['slow motion', 'slowmo', 'slow ga', 'mellanaga', 'smooth motion'],
      speedup: ['fast ga', 'speed ramp', 'speed penchu', 'fast forward'],
      volumeDown: ['sound thagginchu', 'reduce cheyyi', 'thakkuva cheyyi', 'sound low cheyyi', 'bgm thagginchu'],
      volumeUp: ['sound penchu', 'high cheyyi', 'volume penchu', 'sound ekkuva cheyyi'],
      colorGrade: ['color grading', 'colour grading', 'filter', 'look marchu', 'lighting marchu', 'cinema color', 'colour change'],
      transitions: ['transitions', 'smooth transitions', 'cuts smooth ga', 'cut ki cut ki madhya effect'],
      silence: ['silence theesey', 'silent parts teesesey', 'gap lekunda cheyyi', 'jump cuts'],
      bigger: ['peddaga', 'size penchu', 'large', 'bigger', 'font penchu', 'kanipinchela'],
      smaller: ['chinnaga', 'size thagginchu', 'small', 'smaller', 'font thagginchu'],
      removeLast: ['last 5 seconds', 'chivara', 'aakhari', 'ending part', 'last lo'],
      removeStart: ['starting part', 'modalata', 'first few seconds', 'start lo'],
    };

    // Telugu Unicode keywords
    this.teluguUnicodeKeywords = {
      cut: ['తొలగించు', 'తీసివేయి', 'కట్ చేయి', 'తీసేయి', 'ఎడిట్ చేయి'],
      subtitles: ['సబ్‌టైటిల్స్', 'సబ్ టైటిల్స్', 'అక్షరాలు', 'రాతలు', 'తెలుగు సబ్‌టైటిల్స్'],
      music: ['సంగీతం', 'మ్యూజిక్', 'బ్యాక్‌గ్రౌండ్ మ్యూజిక్', 'పాట'],
      cinematic: ['సినిమాటిక్', 'సినిమా శైలి', 'సినీ లుక్'],
      reel: ['రీల్', 'షార్ట్', 'ఇన్‌స్టాగ్రామ్ రీల్', 'లంబంగా'],
      vlog: ['వ్లాగ్', 'యూట్యూబ్ వీడియో', 'వెడల్పుగా'],
      slowmo: ['స్లో మోషన్', 'నెమ్మదిగా'],
      colorGrade: ['కలర్ గ్రేడింగ్', 'రంగులు'],
      silence: ['నిశ్శబ్దం తొలగించు', 'సైలెంట్ పార్ట్స్ తీసేయి'],
      volumeDown: ['ధ్వని తగ్గించు', 'వాల్యూమ్ తగ్గించు', 'శబ్దం తగ్గించు'],
      volumeUp: ['వాల్యూమ్ పెంచు', 'శబ్దం పెంచు'],
      bigger: ['పెద్దగా చేయి', 'సైజు పెంచు'],
      smaller: ['చిన్నగా చేయి', 'సైజు తగ్గించు'],
    };
  }

  /**
   * Analyze input text and return detected intent, target aspect ratio,
   * actions, confidence, and human-friendly response in Telugu and English.
   */
  analyze(input, currentProjectContext = {}) {
    const text = (input || '').trim().toLowerCase();
    const originalText = input || '';

    // Language detection
    const hasTeluguScript = /[\u0C00-\u0C7F]/.test(originalText);
    const detectedLanguage = hasTeluguScript ? 'telugu' : this.detectRomanTelugu(text) ? 'telugu-english' : 'english';

    // Parse Intent & Operations
    const operations = [];
    const parameters = {};

    // 1. Aspect Ratio detection
    let detectedAspectRatio = null;
    if (
      text.includes('9:16') ||
      text.includes('reel') ||
      text.includes('short') ||
      text.includes('vertical') ||
      text.includes('story') ||
      text.includes('tiktok') ||
      text.includes('రీల్') ||
      text.includes('షార్ట్')
    ) {
      detectedAspectRatio = '9:16';
      operations.push({
        type: 'SET_ASPECT_RATIO',
        aspectRatio: '9:16',
        targetWidth: 1080,
        targetHeight: 1920,
        description: 'Convert to vertical format (9:16) for Instagram Reels and YouTube Shorts'
      });
    } else if (
      text.includes('16:9') ||
      text.includes('youtube') ||
      text.includes('vlog') ||
      text.includes('horizontal') ||
      text.includes('landscape') ||
      text.includes('యూట్యూబ్')
    ) {
      detectedAspectRatio = '16:9';
      operations.push({
        type: 'SET_ASPECT_RATIO',
        aspectRatio: '16:9',
        targetWidth: 1920,
        targetHeight: 1080,
        description: 'Convert to cinematic widescreen format (16:9) for YouTube'
      });
    } else if (text.includes('1:1') || text.includes('square') || text.includes('చతురస్రం')) {
      detectedAspectRatio = '1:1';
      operations.push({
        type: 'SET_ASPECT_RATIO',
        aspectRatio: '1:1',
        targetWidth: 1080,
        targetHeight: 1080,
        description: 'Convert to square format (1:1) for social feeds'
      });
    }

    // 2. Cinematic Colour Grading
    if (
      text.includes('cinematic') ||
      text.includes('సినిమాటిక్') ||
      text.includes('color grade') ||
      text.includes('colour grade') ||
      text.includes('కలర్') ||
      text.includes('teal and orange') ||
      text.includes('moody') ||
      text.includes('rich look') ||
      text.includes('cinema style')
    ) {
      let preset = 'teal_orange';
      if (text.includes('moody') || text.includes('dark')) preset = 'moody_warm';
      if (text.includes('vintage') || text.includes('retro')) preset = 'vintage_retro';
      if (text.includes('neon') || text.includes('cyber')) preset = 'neon_cyberpunk';
      if (text.includes('noir') || text.includes('black and white')) preset = 'noir_bw';

      operations.push({
        type: 'APPLY_COLOR_GRADE',
        preset: preset,
        intensity: 0.85,
        description: `Apply cinematic colour grading preset: ${preset.replace('_', ' ').toUpperCase()}`
      });
    }

    // 3. Subtitles Intent
    if (
      text.includes('subtitle') ||
      text.includes('caption') ||
      text.includes('సబ్‌టైటిల్స్') ||
      text.includes('తెలుగు లో') ||
      text.includes('telugu lo') ||
      text.includes('captions')
    ) {
      const language = (text.includes('telugu') || text.includes('తెలుగు')) ? 'te' : 'en';
      let style = 'hormozi';
      if (text.includes('yellow') || text.includes('yellow pop')) style = 'yellow_pop';
      if (text.includes('minimal') || text.includes('clean')) style = 'minimal';
      if (text.includes('cinema') || text.includes('classic')) style = 'cinema_classic';

      operations.push({
        type: 'GENERATE_SUBTITLES',
        language: language,
        style: style,
        fontSize: text.includes('bigger') || text.includes('peddaga') ? 48 : 36,
        description: `Generate synchronized ${language === 'te' ? 'Telugu' : 'English'} subtitles (${style} style)`
      });
    }

    // 4. Subtitle Revision (Bigger / Smaller)
    if (text.includes('bigger') || text.includes('peddaga') || text.includes('size penchu') || text.includes('పెద్దగా చేయి')) {
      operations.push({
        type: 'UPDATE_SUBTITLES',
        fontSizeDelta: +10,
        description: 'Increase subtitle font size for higher visibility'
      });
    } else if (text.includes('smaller') || text.includes('chinnaga') || text.includes('size thagginchu') || text.includes('చిన్నగా చేయి')) {
      operations.push({
        type: 'UPDATE_SUBTITLES',
        fontSizeDelta: -10,
        description: 'Reduce subtitle font size'
      });
    }

    // 5. Silence & Jump Cuts
    if (
      text.includes('silence') ||
      text.includes('silent') ||
      text.includes('jump cut') ||
      text.includes('jump cuts') ||
      text.includes('unnecessary parts') ||
      text.includes('gap lekunda') ||
      text.includes('నిశ్శబ్దం') ||
      text.includes('అనవసరమైన')
    ) {
      operations.push({
        type: 'REMOVE_SILENCE',
        thresholdDb: -32,
        minDurationSec: 0.4,
        description: 'Detect and trim dead pauses and silences with smooth jump cuts'
      });
    }

    // 6. Audio Ducking / Background Music
    if (
      text.includes('bgm') ||
      text.includes('music') ||
      text.includes('సంగీతం') ||
      text.includes('audio') ||
      text.includes('పాట') ||
      text.includes('beats') ||
      text.includes('sync cuts')
    ) {
      const reduceBgm = text.includes('reduce') || text.includes('thagginchu') || text.includes('తగ్గించు') || text.includes('low');
      operations.push({
        type: reduceBgm ? 'ADJUST_AUDIO_LEVELS' : 'ADD_BACKGROUND_MUSIC',
        bgmVolume: reduceBgm ? 0.22 : 0.45,
        ducking: true,
        duckingLevel: 0.18,
        description: reduceBgm
          ? 'Reduce background music volume and enhance speech clarity'
          : 'Mix background music with intelligent voice ducking'
      });
    }

    // 7. Beat Synchronization
    if (text.includes('beat') || text.includes('sync cuts with music') || text.includes('బీట్')) {
      operations.push({
        type: 'SYNC_BEAT_CUTS',
        bpm: 120,
        description: 'Align video clip transitions and cuts to the rhythm beats'
      });
    }

    // 8. Trim specific time (e.g., "remove last 5 seconds", "chivara 5 sec theesey")
    const secondsMatch = text.match(/(\d+)\s*(seconds|sec|సెకన్లు|సెకండ్లు)/);
    if (secondsMatch) {
      const secs = parseInt(secondsMatch[1], 10);
      if (text.includes('last') || text.includes('ending') || text.includes('chivara') || text.includes('aakhari') || text.includes('చివర')) {
        operations.push({
          type: 'TRIM_TIMELINE',
          position: 'end',
          duration: secs,
          description: `Trim and remove the last ${secs} seconds from the video`
        });
      } else if (text.includes('start') || text.includes('first') || text.includes('modalata') || text.includes('ప్రారంభం')) {
        operations.push({
          type: 'TRIM_TIMELINE',
          position: 'start',
          duration: secs,
          description: `Trim and remove the first ${secs} seconds from the video`
        });
      }
    }

    // 9. Slow Motion / Speed Ramp
    if (text.includes('slow motion') || text.includes('slowmo') || text.includes('స్లో మోషన్') || text.includes('mellanaga')) {
      operations.push({
        type: 'APPLY_SPEED_EFFECT',
        speedFactor: 0.5,
        targetClip: 'highlight',
        description: 'Apply cinematic 50% slow motion to highlight segments'
      });
    }

    // 10. Transitions
    if (text.includes('transition') || text.includes('transitions') || text.includes('smooth transitions') || text.includes('మృదువైన పరివర్తనాలు')) {
      operations.push({
        type: 'APPLY_TRANSITIONS',
        transitionType: 'crossfade_zoom',
        durationSec: 0.6,
        description: 'Add smooth modern zoom & crossfade transitions between scene cuts'
      });
    }

    // Default creative enhancement if user just says "Make it cinematic / viral / professional"
    if (operations.length === 0) {
      operations.push(
        {
          type: 'SET_ASPECT_RATIO',
          aspectRatio: '9:16',
          targetWidth: 1080,
          targetHeight: 1920,
          description: 'Format as high-engagement vertical Reel (9:16)'
        },
        {
          type: 'REMOVE_SILENCE',
          thresholdDb: -32,
          minDurationSec: 0.4,
          description: 'Auto-cut silent gaps and pauses'
        },
        {
          type: 'APPLY_COLOR_GRADE',
          preset: 'teal_orange',
          intensity: 0.85,
          description: 'Apply rich cinematic Teal & Orange color grade'
        },
        {
          type: 'GENERATE_SUBTITLES',
          language: detectedLanguage === 'telugu' ? 'te' : 'en',
          style: 'hormozi',
          fontSize: 40,
          description: 'Add dynamic high-energy subtitles'
        }
      );
    }

    // Generate Natural Language Conversational Responses
    const conversationalResponse = this.generateConversationalResponse(
      detectedLanguage,
      operations,
      text,
      currentProjectContext
    );

    return {
      originalPrompt: originalText,
      detectedLanguage: detectedLanguage,
      detectedAspectRatio: detectedAspectRatio || currentProjectContext.aspectRatio || '9:16',
      operations: operations,
      parameters: parameters,
      conversationalResponse: conversationalResponse,
      confidenceScore: 0.94,
    };
  }

  detectRomanTelugu(text) {
    const romanTeluguPatterns = [
      /\b(cheyyi|cheyyandi|pettandi|theesey|teesey|thagginchu|penchu|ivvandi|marchu|lo|ki|undi|kavali|raayi|tayaru)\b/,
      /\b(chinnadi|peddaga|bagundi|leka|undali|ala|ela|motham|oka|rendu|choodu|matladina)\b/
    ];
    return romanTeluguPatterns.some(pattern => pattern.test(text));
  }

  generateConversationalResponse(language, operations, userText, context) {
    const opsList = operations.map(op => `• ${op.description}`).join('\n');

    if (language === 'telugu') {
      return {
        greeting: "నమస్కారం! మీ సూచనలను అర్థం చేసుకున్నాను. Reddy AI Studio మీ వీడియోను ఎడిట్ చేయడానికి సిద్ధంగా ఉంది.",
        planSummary: "నేను రూపొందించిన ఎడిటింగ్ ప్లాన్ ఇక్కడ ఉంది:\n" + opsList,
        callToAction: "ఈ ప్లాన్ సరిగ్గా ఉంటే 'Approve & Execute' నొక్కండి, లేదా ఏవైనా మార్పులు ఉంటే ఇక్కడే చెప్పండి."
      };
    } else if (language === 'telugu-english') {
      return {
        greeting: "Namaskaram! Meeru cheppina instructions clear ga ardamayyay. Reddy AI Studio ready ga undi.",
        planSummary: "Meekosam nenu plan chesina video edits ivigo:\n" + opsList,
        callToAction: "Ee plan meeku okay ante 'Approve & Execute' click cheyyandi, leda edaina changes kavali ante cheppandi!"
      };
    } else {
      return {
        greeting: "Understood! I've analyzed your instructions and formulated an editing plan for your footage.",
        planSummary: "Here is the structured editing plan ready for execution:\n" + opsList,
        callToAction: "Click 'Approve & Execute' to render this immediately, or let me know if you'd like any adjustments."
      };
    }
  }
}

module.exports = { TeluguNlpAgent };
