import React, { useState, useEffect, useRef } from 'react';
import { GameState, VehicleType, GameStats, WpmHistoryPoint, Paragraph } from '../types';
import { PARAGRAPHS } from '../data/paragraphs';
import { Track } from './Track';
import { StatsPanel } from './StatsPanel';
import { Leaderboard } from './Leaderboard';
import {
  playClickSound,
  playErrorSound,
  playCountdownSound,
  playSuccessSound,
} from '../utils/audio';
import { 
  ShieldAlert, 
  Sparkles, 
  Keyboard, 
  Trophy, 
  RefreshCw, 
  Settings, 
  Volume2, 
  VolumeX, 
  Globe, 
  Eye, 
  Sliders 
} from 'lucide-react';

const normalizeChar = (char: string): string => {
  if (!char) return '';
  const c = char.toLowerCase();
  
  // Confused 'ү' / 'у' / 'v' / 'y' characters:
  if (c === 'ү' || c === 'v' || c === 'у' || c === 'y') {
    return 'ү';
  }
  
  // Confused 'ө' / 'о' / 'o' characters:
  if (c === 'ө' || c === 'o' || c === 'о') {
    return 'ө';
  }

  // Confused 'е' / 'e' characters:
  if (c === 'е' || c === 'e') {
    return 'е';
  }

  // Confused 'а' / 'a' characters:
  if (c === 'а' || c === 'a') {
    return 'а';
  }

  // Confused 'с' / 'c' characters:
  if (c === 'с' || c === 'c') {
    return 'с';
  }

  // Confused 'х' / 'x' characters:
  if (c === 'х' || c === 'x') {
    return 'х';
  }

  // Confused 'р' / 'p' characters:
  if (c === 'р' || c === 'p') {
    return 'р';
  }

  // Confused 'і' / 'i' / 'й' characters (sometimes used interchangeably):
  if (c === 'і' || c === 'i' || c === 'й') {
    return 'й';
  }

  // Confused 'к' / 'k' characters:
  if (c === 'к' || c === 'k') {
    return 'к';
  }

  // Confused 'м' / 'm' characters:
  if (c === 'м' || c === 'm') {
    return 'м';
  }

  // Confused 'т' / 't' characters:
  if (c === 'т' || c === 't') {
    return 'т';
  }

  // Confused 'н' / 'h' / 'n' characters:
  if (c === 'н' || c === 'h' || c === 'n') {
    return 'н';
  }

  // Normalize different hyphens/dashes:
  if (c === '-' || c === '—' || c === '–' || c === '⁃') {
    return '-';
  }

  // Normalize different quotation marks/apostrophes:
  if (c === '"' || c === '“' || c === '”' || c === '«' || c === '»' || c === '`' || c === "'" || c === '’' || c === '‘') {
    return '"';
  }

  return c;
};

const areCharsEqual = (charA: string, charB: string): boolean => {
  if (charA === charB) return true;
  if (!charA || !charB) return false;
  
  // Case-insensitive comparison
  if (charA.toLowerCase() === charB.toLowerCase()) return true;
  
  const normA = normalizeChar(charA);
  const normB = normalizeChar(charB);
  
  return normA === normB;
};

// --- MULTILINGUAL TRANSLATION ENGINE ---
const TRANSLATIONS = {
  mn: {
    title: 'TypeRacer Монгол',
    subtitle: 'Англи болон Монгол хэлний хурдны уралдаан',
    difficulty: 'Хүндрэл:',
    all: 'Бүх',
    easy: 'Амархан',
    medium: 'Дундаж',
    hard: 'Хэцүү',
    vehicle: 'УРАЛДАХ ХҮЛЭГ:',
    botLevel: 'БОТЫН ТҮВШИН:',
    slowBot: 'Тайван Бот 🐢',
    mediumBot: 'Дундаж Бот 🤖',
    fastBot: 'Хурдан Бот ⚡',
    changeText: 'Өөр Эх бичвэр',
    startRaceBtn: 'УРАЛДААНЫГ ЭХЛҮҮЛЭХ',
    pressEnterTip: 'Эсвэл "Enter" дарж эхлүүлнэ үү',
    pressEscTip: 'Буцах эсвэл шинээр эхлүүлэхдээ "Escape" дарна уу',
    textSource: 'ЭХ СУРВАЛЖ:',
    countdownReady: 'БЭЛЭН ҮҮ?',
    countdownGo: 'УРАЛД!',
    inputPlaceholderPlaying: 'Дээрх өгүүлбэрийг алдаагүй, хурдан бичиж эхлээрэй...',
    inputPlaceholderIdle: 'Эхлүүлэх товчийг дарна уу',
    errorsLabel: 'Алдаатай үсгийг арилгасны дараа цааш бичнэ.',
    calculatingMetrics: 'Гарны хурд болон нарийвчлалыг шууд тооцоолж байна.',
    charactersCount: 'тэмдэгт',
    settingsTitle: 'Уралдааны Тохиргоо',
    settingsLang: 'Хэлний Сонголт (Language):',
    settingsFontSize: 'Бичвэрийн Үсгийн Хэмжээ:',
    settingsSound: 'Дууны Эффект (SFX):',
    settingsTheme: 'Загварын Өнгө:',
    settingsOn: 'Дуутай',
    settingsOff: 'Хаасан',
    normal: 'Дундаж',
    large: 'Том',
    xlarge: 'Маш Том',
    close: 'Хадгалах & Хаах',
    currentWpm: 'БИЧИХ ХУРД',
    accuracy: 'НАРИЙВЧЛАЛ',
    errors: 'АЛДААНЫ ТОО',
    trackHeader: 'Уралдааны зам',
    liveRacing: 'ШУУД УРАЛДААН',
    readyLabel: 'БЭЛЭН',
    finishedLabel: 'БАРИА',
    settingsBtnText: 'Тохиргоо',
    car: 'Машин',
    rocket: 'Пуужин',
    horse: 'Морь',
    enterNameTitle: 'УРАЛДААНЧИЙН НЭРЭЭ ОРУУЛНА ҮҮ',
    enterNamePlaceholder: 'Таны уралдаанчийн нэр...',
    enterNameBtn: 'БАТЛАХ БА ЭХЛҮҮЛЭХ',
    enterNameError: 'Нэрээ оруулна уу (дээд тал нь 25 тэмдэгт)'
  },
  en: {
    title: 'TypeRacer MN/EN',
    subtitle: 'Typing race tournament in Mongolian & English',
    difficulty: 'Difficulty:',
    all: 'All',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    vehicle: 'VEHICLE RACE CAR:',
    botLevel: 'OPPONENT BOT LEVEL:',
    slowBot: 'Gentle Bot 🐢',
    mediumBot: 'Average Bot 🤖',
    fastBot: 'Lightning Bot ⚡',
    changeText: 'Change Paragraph',
    startRaceBtn: 'START TYPING RACE',
    pressEnterTip: 'Or press "Enter" key to start',
    pressEscTip: 'Press "Escape" key to reset or start over',
    textSource: 'SOURCE:',
    countdownReady: 'READY?',
    countdownGo: 'RACE!',
    inputPlaceholderPlaying: 'Type the passage exactly as shown above...',
    inputPlaceholderIdle: 'Click Start Race to begin',
    errorsLabel: 'Correct the highlighted mistakes to proceed.',
    calculatingMetrics: 'Calculating your real-time WPM speed and accuracy.',
    charactersCount: 'chars',
    settingsTitle: 'Racetrack Settings',
    settingsLang: 'Language Selector (Хэлний Сонголт):',
    settingsFontSize: 'Text Font Size:',
    settingsSound: 'Sound FX (SFX):',
    settingsTheme: 'Accent UI Theme:',
    settingsOn: 'Enabled',
    settingsOff: 'Muted',
    normal: 'Normal',
    large: 'Large',
    xlarge: 'Extra Large',
    close: 'Save & Close',
    currentWpm: 'SPEED WPM',
    accuracy: 'ACCURACY',
    errors: 'ERRORS COUNT',
    trackHeader: 'Racetrack Lanes',
    liveRacing: 'LIVE RACING',
    readyLabel: 'READY',
    finishedLabel: 'FINISHED',
    settingsBtnText: 'Settings',
    car: 'Car',
    rocket: 'Rocket',
    horse: 'Horse',
    enterNameTitle: 'ENTER YOUR RACER NAME',
    enterNamePlaceholder: 'Racer name...',
    enterNameBtn: 'SAVE & START RACE',
    enterNameError: 'Please enter a name (max 25 characters)'
  }
};

// --- PRESET THEME CONFIGURATIONS ---
const THEME_CONFIGS = {
  emerald: {
    text: 'text-emerald-400',
    textAccent: 'text-emerald-500',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-500',
    glow: 'bg-emerald-500/10',
    shadow: 'shadow-emerald-500/20',
    glowHex: 'rgba(16,185,129,0.5)',
    borderFocus: 'focus:border-emerald-500/50 focus:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    trackColor: 'bg-emerald-500',
    avatarGlow: 'rgba(16,185,129,0.5)'
  },
  cyan: {
    text: 'text-cyan-400',
    textAccent: 'text-cyan-500',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-600',
    hoverBg: 'hover:bg-cyan-500',
    glow: 'bg-cyan-500/10',
    shadow: 'shadow-cyan-500/20',
    glowHex: 'rgba(6,182,212,0.5)',
    borderFocus: 'focus:border-cyan-500/50 focus:shadow-[0_0_25px_rgba(6,182,212,0.15)]',
    trackColor: 'bg-cyan-500',
    avatarGlow: 'rgba(6,182,212,0.5)'
  },
  amber: {
    text: 'text-amber-400',
    textAccent: 'text-amber-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-600',
    hoverBg: 'hover:bg-amber-500',
    glow: 'bg-amber-500/10',
    shadow: 'shadow-amber-500/20',
    glowHex: 'rgba(245,158,11,0.5)',
    borderFocus: 'focus:border-amber-500/50 focus:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    trackColor: 'bg-amber-500',
    avatarGlow: 'rgba(245,158,11,0.5)'
  },
  crimson: {
    text: 'text-rose-400',
    textAccent: 'text-rose-500',
    border: 'border-rose-500/30',
    bg: 'bg-rose-600',
    hoverBg: 'hover:bg-rose-500',
    glow: 'bg-rose-500/10',
    shadow: 'shadow-rose-500/20',
    glowHex: 'rgba(244,63,94,0.5)',
    borderFocus: 'focus:border-rose-500/50 focus:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    trackColor: 'bg-rose-500',
    avatarGlow: 'rgba(244,63,94,0.5)'
  }
};

export const TyperacerGame: React.FC = () => {
  // --- SETTINGS AND PERSISTED CONFIGS ---
  const [gameLanguage, setGameLanguage] = useState<'mn' | 'en'>('mn');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [themeColor, setThemeColor] = useState<'emerald' | 'cyan' | 'amber' | 'crimson'>('emerald');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [leaderboardRefreshTrigger, setLeaderboardRefreshTrigger] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>(() => localStorage.getItem('typeracer_player_name') || '');

  // 1. Core Selection States
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [botLevel, setBotLevel] = useState<'slow' | 'medium' | 'fast'>('medium');

  // Find the first paragraph matching current language filter
  const initialParagraph = PARAGRAPHS.find(p => p.lang === 'mn') || PARAGRAPHS[0];

  // 2. Active Game States
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph>(initialParagraph);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [userInput, setUserInput] = useState<string>('');
  
  // 3. Stats Tracking States
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState<number>(0);
  const [history, setHistory] = useState<WpmHistoryPoint[]>([]);

  // 4. Bot Progress State
  const [botProgress, setBotProgress] = useState<number>(0);
  const [botWpm, setBotWpm] = useState<number>(45);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dictionary lookup shortcut
  const t = TRANSLATIONS[gameLanguage];
  const theme = THEME_CONFIGS[themeColor];

  // Sound effect wrappers that check soundOn configuration
  const triggerClickSound = () => soundOn && playClickSound();
  const triggerErrorSound = () => soundOn && playErrorSound();
  const triggerCountdownSound = (isFinal: boolean) => soundOn && playCountdownSound(isFinal);
  const triggerSuccessSound = () => soundOn && playSuccessSound();

  // Bot speed configs
  const BOT_CONFIGS = {
    slow: { wpm: 32, name: t.slowBot },
    medium: { wpm: 52, name: t.mediumBot },
    fast: { wpm: 82, name: t.fastBot },
  };

  // Select a random paragraph based on current filters and language
  const selectRandomParagraph = (diff: 'all' | 'easy' | 'medium' | 'hard', lang: 'mn' | 'en' = 'mn') => {
    const filtered = PARAGRAPHS.filter(p => {
      const matchDiff = diff === 'all' || p.difficulty === diff;
      const matchLang = p.lang === lang;
      return matchDiff && matchLang;
    });
    
    // Choose a random one (excluding the current one if possible, for variety)
    let candidates = filtered;
    if (filtered.length > 1) {
      candidates = filtered.filter(p => p.id !== currentParagraph.id);
    }
    const randomIdx = Math.floor(Math.random() * candidates.length);
    if (candidates[randomIdx]) {
      setCurrentParagraph(candidates[randomIdx]);
    }
  };

  // Initialize a fresh game setup
  const initGame = () => {
    setUserInput('');
    setTimeElapsed(0);
    setErrorsCount(0);
    setTotalCharsTyped(0);
    setBotProgress(0);
    setHistory([]);
    setGameState('idle');
    setCountdown(3);
    
    // Setup Bot speed with slight variance (+- 5 WPM)
    const baseWpm = BOT_CONFIGS[botLevel].wpm;
    const variance = Math.floor(Math.random() * 11) - 5; // -5 to +5
    setBotWpm(Math.max(15, baseWpm + variance));

    // Focus input or set ready
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Trigger game start sequence (countdown)
  const startCountdown = () => {
    if (gameState !== 'idle') return;
    
    setGameState('countdown');
    setCountdown(3);
    triggerCountdownSound(false);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          startGame();
          return 0;
        }
        triggerCountdownSound(false);
        return prev - 1;
      });
    }, 1000);
  };

  // Start the actual racing gameplay
  const startGame = () => {
    triggerCountdownSound(true);
    setGameState('playing');
    setStartTime(performance.now());
    
    // Focus input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle keypresses / Input value changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;

    const value = e.target.value;
    const targetText = currentParagraph.text;

    // Reject inputs longer than the target text
    if (value.length > targetText.length) return;

    // Compare character by character to detect if a mistake was made
    const lengthDiff = value.length - userInput.length;
    
    if (lengthDiff > 0) {
      // User typed a new character
      const newestCharIndex = value.length - 1;
      const expectedChar = targetText[newestCharIndex];
      const typedChar = value[newestCharIndex];

      setTotalCharsTyped((prev) => prev + lengthDiff);

      // Verify correctness up to the current position
      // Check if there is an error in the current typed block
      let hasErrorBefore = false;
      for (let i = 0; i < newestCharIndex; i++) {
        if (!areCharsEqual(value[i], targetText[i])) {
          hasErrorBefore = true;
          break;
        }
      }

      if (hasErrorBefore || !areCharsEqual(typedChar, expectedChar)) {
        // Mistake!
        setErrorsCount((prev) => prev + 1);
        triggerErrorSound();
      } else {
        // Correct character typed
        triggerClickSound();
      }
    }

    setUserInput(value);

    // WIN CONDITION: Match entire paragraph with zero errors (using the robust comparison)
    const isFinishedText = value.length === targetText.length && 
      value.split('').every((char, idx) => areCharsEqual(char, targetText[idx]));
    if (isFinishedText) {
      finishGame();
    }
  };

  // Finalize the game and calculate final stats
  const finishGame = () => {
    setGameState('finished');
    triggerSuccessSound();
    
    // Record final stats point
    if (startTime) {
      const duration = (performance.now() - startTime) / 1000;
      setTimeElapsed(duration);
    }
  };

  // Reset or Change paragraph
  const handleParagraphChange = (diff: 'all' | 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(diff);
    selectRandomParagraph(diff, gameLanguage);
    
    // Clean state
    setUserInput('');
    setTimeElapsed(0);
    setErrorsCount(0);
    setTotalCharsTyped(0);
    setBotProgress(0);
    setHistory([]);
    setGameState('idle');
  };

  // Listen to global keys like Escape/Enter to quickly restart/start
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      initGame();
    } else if (e.key === 'Enter' && gameState === 'idle') {
      if (playerName.trim()) {
        startCountdown();
      }
    }
  };

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (botTimerRef.current) clearInterval(botTimerRef.current);
    };
  }, []);

  // Timer loop for tracking time and logging historical WPM data
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        setTimeElapsed(elapsed);

        // Calculate current correct characters (up to the first mistake)
        let correctCount = 0;
        for (let i = 0; i < userInput.length; i++) {
          if (areCharsEqual(userInput[i], currentParagraph.text[i])) {
            correctCount++;
          } else {
            break; // Stop at first error
          }
        }

        // Calculate active WPM
        const currentWpm = elapsed > 0 ? Math.round((correctCount / 5) / (elapsed / 60)) : 0;
        
        // Calculate active accuracy
        const currentAccuracy = totalCharsTyped > 0 
          ? Math.round(((totalCharsTyped - errorsCount) / totalCharsTyped) * 100) 
          : 100;

        // Save a history point every second
        const secIndex = Math.round(elapsed);
        setHistory((prev) => {
          // If we already have a point for this second, replace or just append if it's new
          const exists = prev.some((p) => p.time === secIndex);
          if (exists) return prev;
          return [...prev, { time: secIndex, wpm: currentWpm, accuracy: Math.max(0, currentAccuracy) }];
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime, userInput, totalCharsTyped, errorsCount, currentParagraph]);

  // Bot Racer simulation loop
  useEffect(() => {
    if (gameState === 'playing') {
      const intervalMs = 100;
      // Characters typed per minute = botWpm * 5
      // Characters typed per millisecond = (botWpm * 5) / (60 * 1000)
      const charsPerTick = (botWpm * 5) / (60 * (1000 / intervalMs));

      let currentBotChars = 0;

      botTimerRef.current = setInterval(() => {
        currentBotChars += charsPerTick * (0.8 + Math.random() * 0.4); // Adds slight human-like speed variation
        const progress = (currentBotChars / currentParagraph.text.length) * 100;

        if (progress >= 100) {
          setBotProgress(100);
          clearInterval(botTimerRef.current!);
        } else {
          setBotProgress(progress);
        }
      }, intervalMs);
    } else {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
    }

    return () => {
      if (botTimerRef.current) clearInterval(botTimerRef.current);
    };
  }, [gameState, botWpm, currentParagraph]);

  // Handle changing difficulty/language inside selection UI
  useEffect(() => {
    initGame();
  }, [currentParagraph, botLevel]);

  // Triggers selection when language changes
  useEffect(() => {
    selectRandomParagraph(selectedDifficulty, gameLanguage);
  }, [gameLanguage]);

  // Helper values for active parsing
  const firstErrorIndex = userInput.split('').findIndex((char, idx) => !areCharsEqual(char, currentParagraph.text[idx]));
  const hasError = firstErrorIndex !== -1;
  const correctCount = firstErrorIndex === -1 ? userInput.length : firstErrorIndex;
  
  // Calculate Live Metrics
  const liveWpm = timeElapsed > 0 ? Math.round((correctCount / 5) / (timeElapsed / 60)) : 0;
  const liveAccuracy = totalCharsTyped > 0 
    ? Math.round(((totalCharsTyped - errorsCount) / totalCharsTyped) * 100) 
    : 100;
  const playerProgress = (correctCount / currentParagraph.text.length) * 100;

  // Render highlighted paragraph text
  const renderParagraphText = () => {
    const text = currentParagraph.text;
    
    // Font sizing classes
    let textSizingClass = 'text-xl md:text-2xl';
    if (fontSize === 'sm') textSizingClass = 'text-lg md:text-xl';
    if (fontSize === 'lg') textSizingClass = 'text-2xl md:text-3xl';

    return (
      <div className={`${textSizingClass} leading-relaxed font-sans font-medium text-slate-400 select-none text-justify tracking-wide transition-all`} id="text-passage">
        {text.split('').map((char, index) => {
          let charStyle = 'text-slate-500';
          let borderStyle = '';

          if (index < userInput.length) {
            if (firstErrorIndex === -1 || index < firstErrorIndex) {
              charStyle = `${theme.text} font-semibold`;
              borderStyle = `border-b-2 border-${themeColor}-500/30`;
            } else {
              charStyle = 'text-red-500 bg-red-500/10 font-semibold';
              borderStyle = 'border-b-2 border-red-500';
            }
          }

          if (index === userInput.length) {
            borderStyle = `${theme.glow} border-b-2 border-${themeColor}-500 text-slate-100 font-bold underline decoration-${themeColor}-500 decoration-2 underline-offset-8`;
            charStyle = 'text-slate-100';
          }

          return (
            <span
              key={index}
              className={`transition-all duration-100 pb-1 ${charStyle} ${borderStyle}`}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-4" id="typeracer-core">
      {/* 1. Header Area with Sleek Style branding and Stats Counters */}
      <header className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-slate-800 rounded-2xl bg-slate-900/40 backdrop-blur-md gap-6 relative">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 ${theme.bg} rounded-lg flex items-center justify-center shadow-lg ${theme.shadow} transition-all duration-300`}>
            <span className="text-xl font-black text-slate-950">T</span>
          </div>
          <div>
            <h1 className="text-xl font-sans font-black tracking-tight uppercase text-white">
              TypeRacer <span className={theme.text}>{gameLanguage.toUpperCase()}</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{t.subtitle}</p>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="flex items-center gap-6 md:gap-8 self-end sm:self-auto">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t.currentWpm}</p>
            <p className={`text-2xl md:text-3xl font-black font-mono ${theme.text}`}>{liveWpm}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t.accuracy}</p>
            <p className={`text-2xl md:text-3xl font-black font-mono ${theme.text}`}>{liveAccuracy}%</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">{t.errors}</p>
            <p className="text-2xl md:text-3xl font-black font-mono text-red-500">{errorsCount}</p>
          </div>

          {/* Settings Trigger Icon */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 hover:text-white text-slate-400 transition-all cursor-pointer flex items-center justify-center relative group"
            id="open-settings-btn"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </header>

      {/* 2. Setup Configuration Area (Compact and Sleek) */}
      <div className="flex flex-col gap-4 bg-slate-900/30 p-5 rounded-2xl border border-slate-800/60">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.difficulty}</span>
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800">
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleParagraphChange(diff)}
                  className={`px-3 py-1.5 text-[11px] font-sans font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? `${theme.bg} text-slate-950 shadow-md ${theme.shadow}`
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff === 'all' ? t.all : diff === 'easy' ? t.easy : diff === 'medium' ? t.medium : t.hard}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => selectRandomParagraph(selectedDifficulty, gameLanguage)}
            disabled={gameState === 'countdown' || gameState === 'playing'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:bg-slate-800 border border-slate-700 text-xs font-sans font-bold uppercase tracking-wider text-slate-300 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer ml-auto sm:ml-0"
          >
            <Sparkles size={13} className={theme.text} />
            <span>{t.changeText}</span>
          </button>
        </div>

        {/* Configuration selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.vehicle}</span>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
              {(['car', 'rocket', 'horse'] as const).map((v) => {
                const isSelected = selectedVehicle === v;
                return (
                  <button
                    key={v}
                    onClick={() => setSelectedVehicle(v)}
                    disabled={gameState === 'countdown' || gameState === 'playing'}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? `${theme.glow} border border-${themeColor}-500/20 ${theme.text}`
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    } disabled:opacity-50`}
                  >
                    <span>{v === 'car' ? '🏎️' : v === 'rocket' ? '🚀' : '🐎'}</span>
                    <span className="text-[10px]">{v === 'car' ? t.car : v === 'rocket' ? t.rocket : t.horse}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.botLevel}</span>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
              {(['slow', 'medium', 'fast'] as const).map((level) => {
                const isSelected = botLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => setBotLevel(level)}
                    disabled={gameState === 'countdown' || gameState === 'playing'}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? `bg-slate-800 border border-slate-700 ${theme.text}`
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    } disabled:opacity-50`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      level === 'slow' ? 'bg-emerald-400' : level === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    <span className="text-[10px]">
                      {level === 'slow' ? t.easy : level === 'medium' ? t.medium : t.hard}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Race Track Section */}
      <Track
        playerProgress={playerProgress}
        botProgress={botProgress}
        playerVehicle={selectedVehicle}
        playerWpm={liveWpm}
        botWpm={botWpm}
        botName={BOT_CONFIGS[botLevel].name}
        gameState={gameState}
        lang={gameLanguage}
      />

      {/* 4. Typing Box Area */}
      <div className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-slate-900/20 border border-slate-800 shadow-2xl relative overflow-hidden" id="playground">
        
        {/* Paragraph Text Viewport */}
        <div className="relative p-6 md:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <span className="absolute -top-2.5 left-4 px-3 py-0.5 text-[9px] font-mono tracking-widest text-slate-500 uppercase bg-slate-950 border border-slate-800 rounded">
            {t.textSource} {currentParagraph.source}
          </span>
          {renderParagraphText()}
        </div>

        {/* Input Block / Countdown Layer */}
        <div className="flex flex-col gap-3 relative">
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 rounded-2xl border border-slate-800/80 z-30 backdrop-blur-sm transition-all p-6 text-center gap-4">
              <div className="max-w-xs w-full flex flex-col gap-2 animate-fadeIn">
                <span className={`text-[10px] font-mono font-black ${theme.text} uppercase tracking-widest flex items-center justify-center gap-1.5`}>
                  <Keyboard size={12} />
                  {t.enterNameTitle}
                </span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlayerName(val);
                    localStorage.setItem('typeracer_player_name', val);
                  }}
                  placeholder={t.enterNamePlaceholder}
                  maxLength={25}
                  className={`w-full bg-slate-900/80 border text-slate-100 rounded-xl px-4 py-2.5 text-xs text-center font-sans focus:outline-none focus:border-${themeColor}-500/50 focus:ring-1 focus:ring-${themeColor}-500/30 placeholder:text-slate-600 transition-all shadow-inner`}
                />
                {!playerName.trim() && (
                  <p className="text-[9px] text-amber-500/80 font-mono uppercase tracking-wider animate-pulse">
                    ⚠️ {t.enterNameError}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  if (playerName.trim()) {
                    startCountdown();
                  }
                }}
                disabled={!playerName.trim()}
                className={`px-8 py-3.5 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-black uppercase tracking-widest text-xs shadow-lg ${theme.shadow} transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100`}
                id="start-race-btn"
              >
                <Trophy size={14} />
                <span>{t.startRaceBtn}</span>
              </button>
              
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                {t.pressEnterTip}
              </p>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800 z-30 backdrop-blur-xs animate-pulse">
              <span className={`text-[10px] font-mono font-black ${theme.text} uppercase tracking-widest`}>{t.countdownReady}</span>
              <span className="text-5xl font-mono font-black text-white mt-1.5">{countdown}</span>
            </div>
          )}

          {/* Typing console input box */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameState !== 'playing'}
              placeholder={gameState === 'playing' ? t.inputPlaceholderPlaying : t.inputPlaceholderIdle}
              className={`w-full bg-slate-950 border-2 rounded-2xl py-5 px-6 text-xl md:text-2xl font-mono focus:outline-none transition-all pr-44 shadow-lg ${
                hasError
                  ? 'border-red-500/50 text-red-300 focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : `border-${themeColor}-500/20 text-${themeColor === 'crimson' ? 'rose' : themeColor}-400 focus:border-${themeColor === 'crimson' ? 'rose' : themeColor}-500/50 focus:shadow-[0_0_25px_rgba(${themeColor === 'emerald' ? '16,185,129' : themeColor === 'cyan' ? '6,182,212' : themeColor === 'amber' ? '245,158,11' : '244,63,94'},0.15)]`
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              id="typeracer-input-field"
            />
            {/* Keycap / Escape indicator on the right side of the input bar */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {hasError ? (
                <div className="text-red-500 flex items-center gap-1 cursor-help animate-bounce" title={t.errorsLabel}>
                  <ShieldAlert size={18} />
                </div>
              ) : null}
              <kbd className="hidden md:inline-block px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-500 font-mono shadow-sm">
                ESC
              </kbd>
              <span className="hidden md:inline text-[9px] text-slate-600 uppercase tracking-widest font-bold">
                {t.restartBtn}
              </span>
            </div>
          </div>

          {/* Bottom guidelines panel */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest px-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-red-500 animate-pulse' : theme.trackColor}`}></span>
              <span>
                {hasError 
                  ? t.errorsLabel 
                  : t.calculatingMetrics}
              </span>
            </div>
            {gameState === 'playing' && (
              <span className="text-slate-400 font-bold">
                {userInput.length} / {currentParagraph.text.length} {t.charactersCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Historical Stats charts & analytics panel */}
      <StatsPanel
        stats={{
          wpm: liveWpm,
          accuracy: liveAccuracy,
          errors: errorsCount,
          correctChars: correctCount,
          totalCharsTyped: totalCharsTyped,
          timeElapsed: timeElapsed,
        }}
        history={history}
        onRestart={initGame}
        isFinished={gameState === 'finished'}
        lang={gameLanguage}
        onScoreSaved={() => setLeaderboardRefreshTrigger(prev => prev + 1)}
        defaultPlayerName={playerName}
      />

      {/* 6. TOP 10 Leaderboard Panel */}
      <Leaderboard
        lang={gameLanguage}
        themeColor={themeColor}
        refreshTrigger={leaderboardRefreshTrigger}
      />

      {/* --- PREMUM BACKDROP SETTINGS DRAWER / MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in transition-all">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Sliders size={20} className={theme.text} />
                <h2 className="text-xl font-sans font-black tracking-tight text-white uppercase">{t.settingsTitle}</h2>
              </div>
              <button 
                onClick={() => {
                  setShowSettings(false);
                  triggerClickSound();
                }}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-5">
              
              {/* 1. Language Configuration Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-0.5">{t.settingsLang}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setGameLanguage('mn');
                      triggerClickSound();
                    }}
                    className={`py-3 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      gameLanguage === 'mn'
                        ? `${theme.bg} text-slate-950 border-transparent shadow-lg ${theme.shadow}`
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Монгол (MN)</span>
                  </button>
                  <button
                    onClick={() => {
                      setGameLanguage('en');
                      triggerClickSound();
                    }}
                    className={`py-3 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      gameLanguage === 'en'
                        ? `${theme.bg} text-slate-950 border-transparent shadow-lg ${theme.shadow}`
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe size={14} />
                    <span>English (EN)</span>
                  </button>
                </div>
              </div>

              {/* 2. Text Font Sizing Configuration */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-0.5">{t.settingsFontSize}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setFontSize(sz);
                        triggerClickSound();
                      }}
                      className={`py-2.5 px-3 rounded-xl font-sans font-bold text-[11px] uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        fontSize === sz
                          ? `bg-slate-800 border-slate-700 ${theme.text}`
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Eye size={12} />
                      <span>{sz === 'sm' ? t.easy : sz === 'md' ? t.normal : t.large}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Audio Sounds Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-0.5">{t.settingsSound}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSoundOn(true);
                      playClickSound(); // immediate sound test trigger
                    }}
                    className={`py-2.5 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      soundOn
                        ? `${theme.glow} border-${themeColor}-500/20 ${theme.text}`
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Volume2 size={14} />
                    <span>{t.settingsOn}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSoundOn(false);
                    }}
                    className={`py-2.5 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      !soundOn
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <VolumeX size={14} />
                    <span>{t.settingsOff}</span>
                  </button>
                </div>
              </div>

              {/* 4. Active Highlight Theme Accent selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-0.5">{t.settingsTheme}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['emerald', 'cyan', 'amber', 'crimson'] as const).map((col) => {
                    const c = THEME_CONFIGS[col];
                    const isSelected = themeColor === col;
                    return (
                      <button
                        key={col}
                        onClick={() => {
                          setThemeColor(col);
                          if (soundOn) playClickSound();
                        }}
                        className={`py-2 px-1 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? `border-slate-500 bg-slate-800/80`
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${
                          col === 'emerald' ? 'bg-emerald-500' : col === 'cyan' ? 'bg-cyan-500' : col === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-[9px] font-sans font-bold capitalize text-slate-400">
                          {col === 'crimson' ? 'rose' : col}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => {
                  setShowSettings(false);
                  triggerClickSound();
                }}
                className={`px-6 py-3 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-bold uppercase tracking-wider text-xs shadow-lg ${theme.shadow} transition-all cursor-pointer w-full`}
              >
                {t.close}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default TyperacerGame;
