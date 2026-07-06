import React, { useState, useEffect, useRef } from 'react';
import { GameState, VehicleType, GameStats, WpmHistoryPoint, Paragraph, MultiplayerPlayer, ChatMessage } from '../types';
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
    enterNameError: 'Нэрээ оруулна уу (дээд тал нь 25 тэмдэгт)',
    gameMode: 'УРАЛДААНЫ ХУГАЦАА:',
    normalMode: 'Төгсгөлгүй',
    fiveMinMode: '5 Минут',
    tenMinMode: '10 Минут',
    timeLeft: 'ҮЛДСЭН ХУГАЦАА',
    multiplayerTabSingle: '🤖 Ганцаарчилсан',
    multiplayerTabMulti: '👥 Онлайн уралдаан',
    multiplayerLobbyTitle: 'ОНЛАЙН ЛОББИ',
    multiplayerLobbySubtitle: 'Хамтдаа уралдаж, хурдаа сорих хэсэг',
    multiplayerEnterNickname: 'Уралдаанчийн нэр:',
    multiplayerQuickMatch: 'Шууд холбогдох (Нийтийн уралдаан)',
    multiplayerQuickMatchDesc: 'Нийтийн өрөөнд бусад уралдаанчидтай шууд таарч хурдаа сорино.',
    multiplayerCreatePrivate: 'Хувийн өрөө үүсгэх',
    multiplayerCreatePrivateDesc: 'Найзуудтайгаа тоглохын тулд тусгай нууц кодтой өрөө үүсгэнэ.',
    multiplayerJoinPrivate: 'Хувийн өрөөнд орох',
    multiplayerEnterCode: 'Өрөөний код:',
    multiplayerBtnJoin: 'Орох',
    multiplayerLobbyPlayers: 'Өрөөнд байгаа уралдаанчид:',
    multiplayerReady: 'Бэлэн',
    multiplayerUnready: 'Бэлэн биш',
    multiplayerStart: 'Уралдаан эхлүүлэх',
    multiplayerChatTitle: 'Өрөөний чат',
    multiplayerChatPlaceholder: 'Энд зурвас бичнэ үү...',
    multiplayerWaitingPlayers: 'Бусад уралдаанчдыг хүлээж байна...',
    multiplayerCountdown: 'Уралдаан {seconds} секундэд эхэлнэ...',
    multiplayerHost: 'Зохион байгуулагч',
    multiplayerLeave: 'Өрөөнөөс гарах',
    multiplayerResultsLeaderboard: 'УРАЛДААНЫ ДҮН',
    multiplayerPlayAgain: 'Дахин уралдах / Өрөөнд буцах'
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
    enterNameError: 'Please enter a name (max 25 characters)',
    gameMode: 'RACE DURATION:',
    normalMode: 'No Limit',
    fiveMinMode: '5 Minutes',
    tenMinMode: '10 Minutes',
    timeLeft: 'TIME LEFT',
    multiplayerTabSingle: '🤖 Single Player',
    multiplayerTabMulti: '👥 Multiplayer',
    multiplayerLobbyTitle: 'ONLINE LOBBY',
    multiplayerLobbySubtitle: 'Race against real-time online players',
    multiplayerEnterNickname: 'Racer Nickname:',
    multiplayerQuickMatch: 'Quick Match (Public)',
    multiplayerQuickMatchDesc: 'Join a public lobby and race against active online typing masters.',
    multiplayerCreatePrivate: 'Create Custom Room',
    multiplayerCreatePrivateDesc: 'Create a custom room and invite friends using a code.',
    multiplayerJoinPrivate: 'Join Custom Room',
    multiplayerEnterCode: 'Room Code:',
    multiplayerBtnJoin: 'Join',
    multiplayerLobbyPlayers: 'Racers in Lobby:',
    multiplayerReady: 'Ready',
    multiplayerUnready: 'Unready',
    multiplayerStart: 'Start Race',
    multiplayerChatTitle: 'Lobby Chat',
    multiplayerChatPlaceholder: 'Type a message...',
    multiplayerWaitingPlayers: 'Waiting for more players...',
    multiplayerCountdown: 'Race starts in {seconds}s...',
    multiplayerHost: 'Host',
    multiplayerLeave: 'Leave Room',
    multiplayerResultsLeaderboard: 'RACE RESULTS',
    multiplayerPlayAgain: 'Rematch / Back to Lobby'
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

  // --- MULTIPLAYER STATES ---
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false);
  const [multiplayerPlayers, setMultiplayerPlayers] = useState<MultiplayerPlayer[]>([]);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState<string>('');
  const [multiplayerPlayerId, setMultiplayerPlayerId] = useState<string | null>(null);
  const [multiplayerIsHost, setMultiplayerIsHost] = useState<boolean>(false);
  const [multiplayerStatus, setMultiplayerStatus] = useState<'lobby' | 'countdown' | 'playing' | 'finished' | null>(null);
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatMessage, setCurrentChatMessage] = useState<string>('');
  const [lobbyCountdownSeconds, setLobbyCountdownSeconds] = useState<number | null>(null);
  const [customRoomInput, setCustomRoomInput] = useState<string>('');

  // 1. Core Selection States
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const [botLevel, setBotLevel] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [gameMode, setGameMode] = useState<'normal' | '5min' | '10min'>('normal');

  // Find the first paragraph matching current language filter
  const initialParagraph = PARAGRAPHS.find(p => p.lang === 'mn') || PARAGRAPHS[0];

  // 2. Active Game States
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph>(initialParagraph);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [userInput, setUserInput] = useState<string>('');
  const [completedCharsCount, setCompletedCharsCount] = useState<number>(0);
  
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
  const wsRef = useRef<WebSocket | null>(null);

  // --- MULTIPLAYER WEBSOCKET CONNECTION & EVENT HANDLERS ---
  const connectToMultiplayer = (roomType: 'public' | 'custom', joinRoomId?: string) => {
    setMultiplayerError(null);
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(socketUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
      socket.send(JSON.stringify({
        type: 'join',
        name: playerName.trim() || `Racer-${Math.floor(100 + Math.random() * 900)}`,
        vehicle: selectedVehicle,
        roomType,
        roomId: joinRoomId,
        lang: gameLanguage,
        difficulty: selectedDifficulty
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'joined':
            setMultiplayerPlayerId(data.playerId);
            setMultiplayerRoomId(data.roomId);
            setMultiplayerIsHost(data.isHost);
            setCurrentParagraph(data.paragraph);
            setMultiplayerPlayers(data.players);
            setMultiplayerStatus('lobby');
            setGameState('idle');
            setChatMessages([]);
            setMultiplayerError(null);
            
            // Auto scroll chat to bottom
            setTimeout(() => {
              const box = document.getElementById('chat-messages-box');
              if (box) box.scrollTop = box.scrollHeight;
            }, 50);
            break;
          
          case 'player-joined':
            setChatMessages(prev => {
              const updated = [...prev, {
                senderId: 'system',
                senderName: 'SYSTEM',
                message: gameLanguage === 'en' ? `${data.player.name} joined the room` : `${data.player.name} өрөөнд орж ирлээ`,
                timestamp: Date.now()
              }];
              setTimeout(() => {
                const box = document.getElementById('chat-messages-box');
                if (box) box.scrollTop = box.scrollHeight;
              }, 50);
              return updated;
            });
            break;

          case 'player-left':
            setChatMessages(prev => {
              const updated = [...prev, {
                senderId: 'system',
                senderName: 'SYSTEM',
                message: gameLanguage === 'en' ? `${data.playerName} left the room` : `${data.playerName} өрөөнөөс гарлаа`,
                timestamp: Date.now()
              }];
              setTimeout(() => {
                const box = document.getElementById('chat-messages-box');
                if (box) box.scrollTop = box.scrollHeight;
              }, 50);
              return updated;
            });
            break;

          case 'room-players-update':
            setMultiplayerPlayers(data.players);
            // Re-sync host status
            const me = data.players.find((p: any) => p.id === multiplayerPlayerId);
            if (me) {
              setMultiplayerIsHost(me.isHost);
            }
            break;

          case 'room-config-updated':
            setGameLanguage(data.lang);
            setSelectedDifficulty(data.difficulty);
            setCurrentParagraph(data.paragraph);
            break;

          case 'lobby-countdown-tick':
            setLobbyCountdownSeconds(data.seconds);
            break;

          case 'lobby-countdown-cancelled':
            setLobbyCountdownSeconds(null);
            break;

          case 'room-status-update':
            if (data.status === 'countdown') {
              setGameState('countdown');
              setCountdown(5);
            } else if (data.status === 'finished') {
              setGameState('finished');
              setMultiplayerPlayers(data.players);
            }
            break;

          case 'countdown-tick':
            setCountdown(data.countdown);
            if (soundOn) {
              triggerCountdownSound(data.countdown === 1);
            }
            break;

          case 'race-start':
            setGameState('playing');
            setStartTime(performance.now());
            setTimeElapsed(0);
            setErrorsCount(0);
            setTotalCharsTyped(0);
            setUserInput('');
            setCompletedCharsCount(0);
            setHistory([]);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 50);
            break;

          case 'player-progress':
            setMultiplayerPlayers(prev => prev.map(p => {
              if (p.id === data.playerId) {
                return { ...p, progress: data.progress, wpm: data.wpm };
              }
              return p;
            }));
            break;

          case 'player-finished':
            setMultiplayerPlayers(prev => prev.map(p => {
              if (p.id === data.playerId) {
                return { 
                  ...p, 
                  isFinished: true, 
                  progress: 100, 
                  wpm: data.wpm, 
                  accuracy: data.accuracy, 
                  finishTime: data.finishTime 
                };
              }
              return p;
            }));
            setChatMessages(prev => {
              const updated = [...prev, {
                senderId: 'system',
                senderName: 'SYSTEM',
                message: gameLanguage === 'en' 
                  ? `🏁 ${data.playerId === multiplayerPlayerId ? 'YOU' : 'A player'} finished! WPM: ${data.wpm}` 
                  : `🏁 ${data.playerId === multiplayerPlayerId ? 'ТА' : 'Уралдаанч'} бариандаа орлоо! Хурд: ${data.wpm} WPM`,
                timestamp: Date.now()
              }];
              setTimeout(() => {
                const box = document.getElementById('chat-messages-box');
                if (box) box.scrollTop = box.scrollHeight;
              }, 50);
              return updated;
            });
            break;

          case 'chat-msg':
            setChatMessages(prev => {
              const updated = [...prev, data];
              setTimeout(() => {
                const box = document.getElementById('chat-messages-box');
                if (box) box.scrollTop = box.scrollHeight;
              }, 50);
              return updated;
            });
            break;

          case 'error':
            setMultiplayerError(data.message);
            break;
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
      setMultiplayerRoomId('');
      setMultiplayerPlayerId(null);
      setMultiplayerPlayers([]);
      setMultiplayerIsHost(false);
      setLobbyCountdownSeconds(null);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      setMultiplayerError(gameLanguage === 'en' ? 'Connection error' : 'Холболтын алдаа гарлаа');
    };
  };

  const leaveMultiplayerRoom = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setMultiplayerRoomId('');
    setMultiplayerPlayerId(null);
    setMultiplayerPlayers([]);
    setMultiplayerIsHost(false);
    setGameState('idle');
    setLobbyCountdownSeconds(null);
    initGame();
  };

  const sendChatMessage = () => {
    if (!currentChatMessage.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'chat',
      message: currentChatMessage.trim()
    }));
    setCurrentChatMessage('');
  };

  const toggleMultiplayerReady = () => {
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'toggle-ready'
    }));
  };

  const startMultiplayerRace = () => {
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'start-race'
    }));
  };

  // Sync configuration updates from Host to Server
  useEffect(() => {
    if (isMultiplayer && multiplayerIsHost && multiplayerRoomId.startsWith('ROOM-') && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update-config',
        lang: gameLanguage,
        difficulty: selectedDifficulty
      }));
    }
  }, [gameLanguage, selectedDifficulty]);

  // Clean WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);


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
    setCompletedCharsCount(0);
    
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

    // Calculate progress and wpm locally to ensure accuracy and real-time responsiveness
    if (isMultiplayer && wsRef.current?.readyState === WebSocket.OPEN) {
      let localCorrectCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (areCharsEqual(value[i], targetText[i])) {
          localCorrectCount++;
        } else {
          break;
        }
      }
      const progress = targetText.length > 0 ? (localCorrectCount / targetText.length) * 100 : 0;
      const elapsed = startTime ? (performance.now() - startTime) / 1000 : 0;
      const currentWpm = elapsed > 0 ? Math.round((localCorrectCount / 5) / (elapsed / 60)) : 0;

      wsRef.current.send(JSON.stringify({
        type: 'progress',
        progress: Math.min(100, Math.max(0, progress)),
        wpm: currentWpm
      }));
    }

    // WIN CONDITION: Match entire paragraph with zero errors (using the robust comparison)
    const isFinishedText = value.length === targetText.length && 
      value.split('').every((char, idx) => areCharsEqual(char, targetText[idx]));
    if (isFinishedText) {
      if (isMultiplayer) {
        const elapsed = startTime ? (performance.now() - startTime) / 1000 : 0;
        const finalWpm = elapsed > 0 ? Math.round((targetText.length / 5) / (elapsed / 60)) : 0;
        const currentTotalTyped = totalCharsTyped + lengthDiff;
        const finalAccuracy = currentTotalTyped > 0 
          ? Math.round(((currentTotalTyped - errorsCount) / currentTotalTyped) * 100) 
          : 100;

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'finished',
            wpm: finalWpm,
            accuracy: finalAccuracy
          }));
        }
        setGameState('finished');
        triggerSuccessSound();
      } else if (gameMode === '5min' || gameMode === '10min') {
        triggerSuccessSound();
        setCompletedCharsCount((prev) => prev + targetText.length);
        setUserInput('');
        selectRandomParagraph(selectedDifficulty, gameLanguage);
      } else {
        finishGame();
      }
    }
  };

  // Finalize the game and calculate final stats
  const finishGame = () => {
    setGameState('finished');
    triggerSuccessSound();
    
    // Record final stats point
    if (startTime) {
      const duration = (performance.now() - startTime) / 1000;
      setTimeElapsed(
        gameMode === '5min' 
          ? Math.min(300, duration) 
          : gameMode === '10min' 
          ? Math.min(600, duration) 
          : duration
      );
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
    if (isMultiplayer) return; // Prevent global reset keys in multiplayer
    
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

  // Timer loop for tracking elapsed time smoothly and continuously while typing
  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        if (gameMode === '5min' && elapsed >= 300) {
          setTimeElapsed(300);
          finishGame();
        } else if (gameMode === '10min' && elapsed >= 600) {
          setTimeElapsed(600);
          finishGame();
        } else {
          setTimeElapsed(elapsed);
        }
      }, 100); // 100ms interval for precise real-time display updates
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime, gameMode]);

  // Record WPM and Accuracy history point for each elapsed second
  const roundedElapsed = Math.floor(timeElapsed);
  useEffect(() => {
    if (gameState !== 'playing' || roundedElapsed === 0) return;

    // Calculate current correct characters (up to the first mistake)
    let correctCount = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (areCharsEqual(userInput[i], currentParagraph.text[i])) {
        correctCount++;
      } else {
        break; // Stop at first error
      }
    }

    const totalCorrect = completedCharsCount + correctCount;

    // Calculate active WPM
    const currentWpm = roundedElapsed > 0 ? Math.round((totalCorrect / 5) / (roundedElapsed / 60)) : 0;
    
    // Calculate active accuracy
    const currentAccuracy = totalCharsTyped > 0 
      ? Math.round(((totalCharsTyped - errorsCount) / totalCharsTyped) * 100) 
      : 100;

    setHistory((prev) => {
      const exists = prev.some((p) => p.time === roundedElapsed);
      if (exists) return prev;
      return [...prev, { time: roundedElapsed, wpm: currentWpm, accuracy: Math.max(0, currentAccuracy) }];
    });
  }, [roundedElapsed, gameState, userInput, totalCharsTyped, errorsCount, currentParagraph, completedCharsCount]);

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
          if (gameMode === '5min' || gameMode === '10min') {
            currentBotChars = 0;
            setBotProgress(0);
          } else {
            setBotProgress(100);
            clearInterval(botTimerRef.current!);
          }
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
  }, [gameState, botWpm, currentParagraph, gameMode]);

  // Handle changing difficulty/language inside selection UI
  useEffect(() => {
    if (gameState !== 'playing') {
      initGame();
    }
  }, [currentParagraph, botLevel]);

  // Triggers selection when language changes
  useEffect(() => {
    selectRandomParagraph(selectedDifficulty, gameLanguage);
  }, [gameLanguage]);

  // Helper values for active parsing
  const firstErrorIndex = userInput.split('').findIndex((char, idx) => !areCharsEqual(char, currentParagraph.text[idx]));
  const hasError = firstErrorIndex !== -1;
  const correctCount = firstErrorIndex === -1 ? userInput.length : firstErrorIndex;
  const totalCorrectChars = completedCharsCount + correctCount;

  const timeLeft = gameMode === '5min' 
    ? Math.max(0, 300 - Math.floor(timeElapsed)) 
    : gameMode === '10min' 
    ? Math.max(0, 600 - Math.floor(timeElapsed)) 
    : 300;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate Live Metrics
  const liveWpm = timeElapsed > 0 ? Math.round((totalCorrectChars / 5) / (timeElapsed / 60)) : 0;
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

  const getVehicleTypeConfig = (type: VehicleType) => {
    const configs = {
      car: { emoji: '🏎️' },
      rocket: { emoji: '🚀' },
      horse: { emoji: '🐎' }
    };
    return configs[type] || configs.car;
  };

  const renderMultiplayerChat = () => {
    return (
      <div className="flex flex-col gap-4 p-5 rounded-3xl bg-slate-900/30 border border-slate-800 h-[480px] md:h-auto">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 pb-3 border-b border-slate-800/50">
          💬 {t.multiplayerChatTitle}
        </h3>
        
        {/* Messages Body */}
        <div 
          id="chat-messages-box" 
          className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[340px] md:max-h-none min-h-[220px]"
        >
          {chatMessages.length === 0 ? (
            <div className="my-auto text-center text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-loose">
              No messages yet.<br />Send a friendly greeting!
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const isSystem = msg.senderId === 'system';
              if (isSystem) {
                return (
                  <div key={index} className="text-center py-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
                    {msg.message}
                  </div>
                );
              }
              const isMe = msg.senderId === multiplayerPlayerId;
              return (
                <div key={index} className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <span className="text-[9px] font-mono text-slate-500 font-bold mb-0.5 truncate max-w-[120px]">
                    {msg.senderName}
                  </span>
                  <div className={`px-3 py-2 rounded-xl text-xs font-sans break-words leading-relaxed ${
                    isMe 
                      ? `${theme.bg} text-slate-950 font-medium rounded-tr-none shadow-sm` 
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-inner'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat input form */}
        <div className="flex gap-2 border-t border-slate-800/40 pt-3 relative">
          <input
            type="text"
            value={currentChatMessage}
            onChange={(e) => setCurrentChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendChatMessage();
              }
            }}
            placeholder={t.multiplayerChatPlaceholder}
            className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-sans focus:outline-none focus:border-slate-600 placeholder:text-slate-700 transition-all"
          />
          <button
            onClick={sendChatMessage}
            className={`px-4 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all cursor-pointer ${
              currentChatMessage.trim() 
                ? `${theme.bg} text-slate-950` 
                : 'bg-slate-800 text-slate-600'
            }`}
          >
            {gameLanguage === 'en' ? 'SEND' : 'ИЛГЭЭХ'}
          </button>
        </div>
      </div>
    );
  };

  const renderMultiplayerJoinSelector = () => {
    return (
      <div className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-800" id="mp-lobby-selector">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-sans font-black tracking-tight text-white uppercase">{t.multiplayerLobbyTitle}</h2>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{t.multiplayerLobbySubtitle}</p>
        </div>

        {multiplayerError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-wider">
            ⚠️ {multiplayerError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1: Nickname & Vehicle */}
          <div className="flex flex-col gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-800 flex-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">👤 {t.multiplayerEnterNickname}</h3>
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
              className={`w-full bg-slate-900 border text-slate-100 rounded-xl px-4 py-2.5 text-xs font-sans focus:outline-none focus:border-${themeColor}-500/50 focus:ring-1 focus:ring-${themeColor}-500/30 placeholder:text-slate-600 transition-all shadow-inner`}
            />

            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.vehicle}</span>
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                {(['car', 'rocket', 'horse'] as const).map((v) => {
                  const isSelected = selectedVehicle === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setSelectedVehicle(v)}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? `${theme.glow} border border-${themeColor}-500/20 ${theme.text}`
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      <span className="text-xl">{v === 'car' ? '🏎️' : v === 'rocket' ? '🚀' : '🐎'}</span>
                      <span className="text-[8px] mt-0.5">{v === 'car' ? t.car : v === 'rocket' ? t.rocket : t.horse}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Quick Match */}
          <div className="flex flex-col justify-between p-5 bg-slate-950/40 rounded-2xl border border-slate-800 flex-1">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">⚡ {t.multiplayerQuickMatch}</h3>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{t.multiplayerQuickMatchDesc}</p>
            </div>
            <button
              onClick={() => connectToMultiplayer('public')}
              className={`w-full py-3.5 px-6 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-black uppercase tracking-widest text-xs shadow-lg ${theme.shadow} transition-all mt-4 hover:scale-102 active:scale-98`}
            >
              🚀 {t.startRaceBtn}
            </button>
          </div>

          {/* Card 3: Private Custom Room */}
          <div className="flex flex-col gap-4 p-5 bg-slate-950/40 rounded-2xl border border-slate-800 flex-1 justify-between">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">🔒 {t.multiplayerJoinPrivate}</h3>
              <p className="text-[11px] text-slate-500 font-sans leading-relaxed">{t.multiplayerCreatePrivateDesc}</p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => connectToMultiplayer('custom')}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:bg-slate-800 border border-slate-700 text-xs font-sans font-bold uppercase tracking-wider text-slate-300 transition-all cursor-pointer"
              >
                ➕ {t.multiplayerCreatePrivate}
              </button>

              <div className="relative mt-2">
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value.toUpperCase())}
                  placeholder="ROOM-XXXXX"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl pl-4 pr-20 py-2.5 text-xs font-mono focus:outline-none focus:border-slate-600 placeholder:text-slate-600 transition-all"
                />
                <button
                  disabled={!customRoomInput.trim()}
                  onClick={() => connectToMultiplayer('custom', customRoomInput.trim().toUpperCase())}
                  className={`absolute right-1 top-1 bottom-1 px-4 rounded-lg text-[10px] font-sans font-black uppercase tracking-widest transition-all ${
                    customRoomInput.trim()
                      ? `${theme.bg} text-slate-950 hover:opacity-90 cursor-pointer`
                      : 'bg-slate-800 text-slate-600 disabled:opacity-40'
                  }`}
                >
                  {t.multiplayerBtnJoin}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMultiplayerLobby = () => {
    const isCustomRoom = multiplayerRoomId.startsWith('ROOM-');
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="mp-active-lobby">
        {/* Left Side: Room details & Racers */}
        <div className="md:col-span-2 flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-800 justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
              <div className="flex flex-col gap-1">
                <span className={`text-[10px] font-mono font-bold ${theme.text} uppercase tracking-widest`}>
                  {isCustomRoom ? '🔒 CUSTOM PRIVATE LOBBY' : '⚡ PUBLIC MATCHMAKING'}
                </span>
                <h2 className="text-xl font-mono font-black text-white">{multiplayerRoomId}</h2>
              </div>
              
              {/* Copy button for Custom Room Code */}
              {isCustomRoom && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(multiplayerRoomId);
                    alert(gameLanguage === 'en' ? 'Room Code Copied!' : 'Өрөөний код хуулагдлаа!');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-[10px] font-sans font-bold uppercase tracking-wider text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  📋 {gameLanguage === 'en' ? 'COPY' : 'ХУУЛАХ'}
                </button>
              )}
            </div>

            {/* Configuration Summary or Controls */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex flex-col gap-4 mt-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">⚙️ {gameLanguage === 'en' ? 'RACE CONFIGURATION' : 'ТОХИРГОО'}</h3>
              
              {isCustomRoom && multiplayerIsHost ? (
                /* Host controls */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.settingsLang}</span>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setGameLanguage('mn')}
                        className={`py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all ${
                          gameLanguage === 'mn' ? `${theme.bg} text-slate-950` : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Монгол
                      </button>
                      <button
                        onClick={() => setGameLanguage('en')}
                        className={`py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all ${
                          gameLanguage === 'en' ? `${theme.bg} text-slate-950` : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.difficulty}</span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                      {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`py-2 text-[9px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all ${
                            selectedDifficulty === diff ? `${theme.bg} text-slate-950` : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {diff === 'all' ? t.all : diff === 'easy' ? t.easy : diff === 'medium' ? t.medium : t.hard}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-host overview */
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider">LANGUAGE:</span>
                    <span className="text-xs font-sans font-bold text-slate-300 uppercase">{gameLanguage === 'mn' ? 'Монгол (MN)' : 'English (EN)'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-slate-500 tracking-wider">DIFFICULTY:</span>
                    <span className={`text-xs font-sans font-bold uppercase ${theme.text}`}>{selectedDifficulty}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 italic font-mono uppercase ml-auto">
                    {isCustomRoom ? '• HOST IS MANAGING SETTINGS' : '• STANDARD POOL RULES'}
                  </span>
                </div>
              )}
            </div>

            {/* Connected Racers list */}
            <div className="flex flex-col gap-3 mt-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">{t.multiplayerLobbyPlayers}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {multiplayerPlayers.map((player) => {
                  const isCurrent = player.id === multiplayerPlayerId;
                  const vehicleCfg = getVehicleTypeConfig(player.vehicle);
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-950/60 border-emerald-500/20'
                          : 'bg-slate-950/25 border-slate-800'
                      }`}
                    >
                      <span className="text-2xl filter drop-shadow-md">{vehicleCfg.emoji}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-sans font-bold text-slate-200">
                          {player.name} {isCurrent && <span className="text-[10px] text-slate-500">(ТА)</span>}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-slate-500">
                          {player.isHost ? '👑 HOST' : 'RACER'}
                        </span>
                      </div>
                      
                      {/* Ready state icon */}
                      <div className="ml-auto">
                        {isCustomRoom ? (
                          player.ready ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase tracking-widest">
                              {t.multiplayerReady}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-500 border border-transparent rounded text-[9px] font-bold uppercase tracking-widest">
                              {t.multiplayerUnready}
                            </span>
                          )
                        ) : (
                          <span className="text-emerald-500 text-xs">●</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Play/Ready Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800/40 items-center justify-between mt-5">
            <button
              onClick={leaveMultiplayerRoom}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 hover:border-red-500/30 hover:text-red-400 text-xs font-sans font-bold uppercase tracking-wider text-slate-500 transition-all cursor-pointer"
            >
              ⬅️ {t.multiplayerLeave}
            </button>

            {/* Countdown / Matchmaking alert */}
            {lobbyCountdownSeconds !== null ? (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest animate-pulse">
                ⏳ {t.multiplayerCountdown.replace('{seconds}', lobbyCountdownSeconds.toString())}
              </div>
            ) : !isCustomRoom ? (
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                {t.multiplayerWaitingPlayers}
              </div>
            ) : null}

            {isCustomRoom ? (
              multiplayerIsHost ? (
                <button
                  onClick={startMultiplayerRace}
                  className={`w-full sm:w-auto px-10 py-3 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-black uppercase tracking-widest text-xs shadow-lg ${theme.shadow} transition-all cursor-pointer hover:scale-102 active:scale-98`}
                >
                  🟢 {t.multiplayerStart}
                </button>
              ) : (
                <button
                  onClick={toggleMultiplayerReady}
                  className={`w-full sm:w-auto px-10 py-3 rounded-xl font-sans font-black uppercase tracking-widest text-xs shadow-lg transition-all cursor-pointer hover:scale-102 active:scale-98 ${
                    multiplayerPlayers.find(p => p.id === multiplayerPlayerId)?.ready
                      ? 'bg-slate-800 border border-slate-700 text-slate-300'
                      : `${theme.bg} text-slate-950 ${theme.shadow}`
                  }`}
                >
                  {multiplayerPlayers.find(p => p.id === multiplayerPlayerId)?.ready ? `❌ ${t.multiplayerUnready}` : `✓ ${t.multiplayerReady}`}
                </button>
              )
            ) : (
              /* Public room auto-ready */
              <button
                onClick={startMultiplayerRace}
                className={`w-full sm:w-auto px-10 py-3 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-black uppercase tracking-widest text-xs shadow-lg ${theme.shadow} transition-all cursor-pointer hover:scale-102 active:scale-98`}
              >
                🏁 {t.startRaceBtn}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        {renderMultiplayerChat()}
      </div>
    );
  };

  const renderMultiplayerResults = () => {
    // Sort players by finish time or progress
    const sorted = [...multiplayerPlayers].sort((a, b) => {
      if (a.isFinished && b.isFinished) {
        return (a.finishTime || 0) - (b.finishTime || 0);
      }
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.progress - a.progress;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="mp-results-board">
        <div className="md:col-span-2 flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-800">
          <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-800/80">
            <span className={`text-[10px] font-mono font-bold ${theme.text} uppercase tracking-widest`}>🏁 RACE RESULTS</span>
            <h2 className="text-xl font-sans font-black text-white uppercase">{t.multiplayerResultsLeaderboard}</h2>
          </div>

          <div className="flex flex-col gap-3">
            {sorted.map((player, index) => {
              const isCurrent = player.id === multiplayerPlayerId;
              const vehicleCfg = getVehicleTypeConfig(player.vehicle);
              
              return (
                <div 
                  key={player.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isCurrent 
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-md' 
                      : 'bg-slate-950/25 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-black text-slate-500 w-6 text-center">
                      #{index + 1}
                    </span>
                    <span className="text-2xl filter drop-shadow-md">{vehicleCfg.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-sans font-bold text-slate-200">
                        {player.name} {isCurrent && <span className="text-[10px] text-slate-500">(ТА)</span>}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        {player.isHost ? '👑 HOST' : 'RACER'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">SPEED</span>
                      <span className={`text-sm font-mono font-black ${theme.text}`}>{player.wpm} WPM</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">ACCURACY</span>
                      <span className="text-sm font-mono font-black text-slate-300">{player.accuracy || 100}%</span>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">DURATION</span>
                      <span className="text-sm font-mono font-black text-slate-400">
                        {player.isFinished ? `${player.finishTime?.toFixed(1)}s` : 'RACING...'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/40 flex justify-end">
            <button
              onClick={leaveMultiplayerRoom}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-xl ${theme.bg} ${theme.hoverBg} text-slate-950 font-sans font-black uppercase tracking-widest text-xs shadow-lg ${theme.shadow} transition-all cursor-pointer w-full sm:w-auto`}
            >
              🔄 {t.multiplayerPlayAgain}
            </button>
          </div>
        </div>

        {/* Chat box */}
        {renderMultiplayerChat()}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-4" id="typeracer-core">
      {/* Game Mode Tab Selector (Single Player vs Multiplayer) */}
      <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 w-full md:w-fit self-center md:self-start shadow-lg">
        <button
          onClick={() => {
            setIsMultiplayer(false);
            leaveMultiplayerRoom();
          }}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-sans font-black uppercase tracking-widest transition-all cursor-pointer ${
            !isMultiplayer
              ? `${theme.bg} text-slate-950 shadow-md ${theme.shadow}`
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.multiplayerTabSingle}
        </button>
        <button
          onClick={() => {
            setIsMultiplayer(true);
            setGameState('idle');
          }}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-sans font-black uppercase tracking-widest transition-all cursor-pointer ${
            isMultiplayer
              ? `${theme.bg} text-slate-950 shadow-md ${theme.shadow}`
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.multiplayerTabMulti}
        </button>
      </div>

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
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
              {(gameMode === '5min' || gameMode === '10min') ? t.timeLeft : (gameLanguage === 'en' ? 'TIME' : 'ХУГАЦАА')}
            </p>
            <p className={`text-2xl md:text-3xl font-black font-mono ${(gameMode === '5min' || gameMode === '10min') && timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
              {(gameMode === '5min' || gameMode === '10min') ? formatTime(timeLeft) : `${timeElapsed.toFixed(1)}s`}
            </p>
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

      {!isMultiplayer ? (
        <>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/40 pt-4">
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

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">{t.gameMode}</span>
                <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
                  {(['normal', '5min', '10min'] as const).map((mode) => {
                    const isSelected = gameMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          setGameMode(mode);
                          initGame();
                        }}
                        disabled={gameState === 'countdown' || gameState === 'playing'}
                        className={`flex items-center justify-center gap-1 px-1 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? `bg-slate-800 border border-slate-700 ${theme.text}`
                            : 'text-slate-500 hover:text-slate-300 border border-transparent'
                        } disabled:opacity-50`}
                      >
                        <span>{mode === 'normal' ? '🏁' : '⏱️'}</span>
                        <span>{mode === 'normal' ? t.normalMode : mode === '5min' ? t.fiveMinMode : t.tenMinMode}</span>
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
            isMultiplayer={isMultiplayer}
            multiplayerPlayers={multiplayerPlayers}
            currentPlayerId={multiplayerPlayerId}
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
              correctChars: totalCorrectChars,
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
        </>
      ) : (
        /* MULTIPLAYER AREA */
        <>
          {!multiplayerRoomId ? (
            renderMultiplayerJoinSelector()
          ) : gameState === 'idle' ? (
            renderMultiplayerLobby()
          ) : gameState === 'finished' ? (
            <>
              <Track
                playerProgress={playerProgress}
                botProgress={botProgress}
                playerVehicle={selectedVehicle}
                playerWpm={liveWpm}
                botWpm={botWpm}
                botName={BOT_CONFIGS[botLevel].name}
                gameState={gameState}
                lang={gameLanguage}
                isMultiplayer={isMultiplayer}
                multiplayerPlayers={multiplayerPlayers}
                currentPlayerId={multiplayerPlayerId}
              />
              {renderMultiplayerResults()}
            </>
          ) : (
            /* COUNTDOWN OR PLAYING ACTIVE RACE */
            <>
              <Track
                playerProgress={playerProgress}
                botProgress={botProgress}
                playerVehicle={selectedVehicle}
                playerWpm={liveWpm}
                botWpm={botWpm}
                botName={BOT_CONFIGS[botLevel].name}
                gameState={gameState}
                lang={gameLanguage}
                isMultiplayer={isMultiplayer}
                multiplayerPlayers={multiplayerPlayers}
                currentPlayerId={multiplayerPlayerId}
              />
              
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
                    {/* Keycap indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      {hasError ? (
                        <div className="text-red-500 flex items-center gap-1 cursor-help animate-bounce" title={t.errorsLabel}>
                          <ShieldAlert size={18} />
                        </div>
                      ) : null}
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
            </>
          )}
        </>
      )}

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
