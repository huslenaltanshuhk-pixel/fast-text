import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { GameStats, WpmHistoryPoint } from '../types';
import { Award, Zap, AlertTriangle, Timer, Target, RefreshCw, Send, Check } from 'lucide-react';
import { saveScore } from '../lib/firebase';

interface StatsPanelProps {
  stats: GameStats;
  history: WpmHistoryPoint[];
  onRestart: () => void;
  isFinished: boolean;
  lang?: 'mn' | 'en';
  onScoreSaved?: () => void;
  defaultPlayerName?: string;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  history,
  onRestart,
  isFinished,
  lang = 'mn',
  onScoreSaved,
  defaultPlayerName = '',
}) => {
  // --- Score Submission States ---
  const [racerName, setRacerName] = useState(defaultPlayerName);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset local states when game restarts or finished status changes
  useEffect(() => {
    if (!isFinished) {
      setRacerName('');
      setIsSaved(false);
      setIsSaving(false);
      setErrorMsg('');
    } else {
      setRacerName(defaultPlayerName);
    }
  }, [isFinished, defaultPlayerName]);

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = racerName.trim();
    if (!trimmedName) {
      setErrorMsg(lang === 'en' ? 'Please enter a name' : 'Нэрээ оруулна уу');
      return;
    }
    if (trimmedName.length > 25) {
      setErrorMsg(lang === 'en' ? 'Name must be 25 characters or less' : 'Нэр 25-аас олон тэмдэгт байж болохгүй');
      return;
    }
    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await saveScore({
        name: trimmedName,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        timeElapsed: stats.timeElapsed,
        lang: lang as 'mn' | 'en',
      });
      if (res.success) {
        setIsSaved(true);
        if (onScoreSaved) {
          onScoreSaved();
        }
      } else {
        setErrorMsg(lang === 'en' ? 'Failed to save score' : 'Амжилт хадгалахад алдаа гарлаа');
      }
    } catch (err) {
      setErrorMsg(lang === 'en' ? 'An unexpected error occurred' : 'Алдаа гарлаа, дахин оролдоно уу');
    } finally {
      setIsSaving(false);
    }
  };
  // Determine trophy or feedback text based on performance
  const getFeedback = (wpm: number, accuracy: number) => {
    const isEn = lang === 'en';
    if (wpm >= 80 && accuracy >= 95) {
      return {
        title: isEn ? 'Incredibly Fast! 👑' : 'Гайхалтай хурдан! 👑',
        desc: isEn ? 'You are typing at a professional speed level!' : 'Та бол мэргэжлийн хэмжээний хурдан бичээч юм байна!',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        badge: isEn ? '🏆 Gold Cup' : '🏆 Алтан цом',
      };
    } else if (wpm >= 50 && accuracy >= 90) {
      return {
        title: isEn ? 'Excellent Job! ✨' : 'Маш сайн байна! ✨',
        desc: isEn ? 'Above average speed and high typing accuracy!' : 'Дунджаас дээгүүр гайхалтай хурд болон өндөр нарийвчлал!',
        color: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
        badge: isEn ? '🥈 Silver Medal' : '🥈 Мөнгөн медаль',
      };
    } else if (wpm >= 30) {
      return {
        title: isEn ? 'Good Job! 👍' : 'Сайн байна! 👍',
        desc: isEn ? 'Great effort! Keep practicing and conquer the track!' : 'Сайн байна, улам хичээж уралдааны замаа дахин дахин эзлээрэй!',
        color: 'text-emerald-400/80 bg-emerald-500/5 border-emerald-500/10',
        badge: isEn ? '🥉 Bronze Medal' : '🥉 Хүрэл медаль',
      };
    } else {
      return {
        title: isEn ? 'Keep Practicing! 💪' : 'Урамтай байна! 💪',
        desc: isEn ? 'Practice is the key to speed. Keep working at it!' : 'Дасгал сургуулилт амжилтын үндэс. Дахин оролдоод хурдаа нэмээрэй!',
        color: 'text-slate-400 bg-slate-800/40 border-slate-700/30',
        badge: isEn ? '🏅 Participation Badge' : '🏅 Оролцооны тэмдэг',
      };
    }
  };

  const feedback = getFeedback(stats.wpm, stats.accuracy);

  return (
    <div className="w-full flex flex-col gap-6" id="stats-panel-container">
      {/* 1. Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute right-2 top-2 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
            <Zap size={36} />
          </div>
          <span className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'en' ? 'Speed (WPM)' : 'Бичих хурд (WPM)'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-emerald-400 tracking-tight">{stats.wpm}</span>
            <span className="text-xs text-slate-400 font-medium font-sans">
              {lang === 'en' ? 'wpm' : 'үг/мин'}
            </span>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute right-2 top-2 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
            <Target size={36} />
          </div>
          <span className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'en' ? 'Accuracy' : 'Нарийвчлал'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-emerald-400 tracking-tight">{stats.accuracy}</span>
            <span className="text-xs text-slate-400 font-medium font-sans">%</span>
          </div>
        </div>

        {/* Errors Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="absolute right-2 top-2 text-red-500/20 group-hover:text-red-500/30 transition-colors">
            <AlertTriangle size={36} />
          </div>
          <span className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'en' ? 'Errors' : 'Алдааны тоо'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-red-500 tracking-tight">{stats.errors}</span>
            <span className="text-xs text-slate-400 font-medium font-sans">
              {lang === 'en' ? 'times' : 'удаа'}
            </span>
          </div>
        </div>

        {/* Time Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute right-2 top-2 text-emerald-500/20 group-hover:text-emerald-500/30 transition-colors">
            <Timer size={36} />
          </div>
          <span className="text-xs font-sans text-slate-500 font-bold uppercase tracking-wider">
            {lang === 'en' ? 'Time Elapsed' : 'Хугацаа'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-black text-emerald-400 tracking-tight">
              {stats.timeElapsed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-medium font-sans">
              {lang === 'en' ? 'sec' : 'сек'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Finished Game View */}
      {isFinished && (
        <div className="flex flex-col lg:flex-row gap-8 p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl relative animate-fade-in" id="finished-stats-showcase">
          {/* Winner Details & Reset */}
          <div className="flex flex-col justify-between flex-1 gap-6">
            <div className="flex flex-col gap-4">
              <div className={`self-start flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${feedback.color}`}>
                <Award size={14} />
                <span>{feedback.badge}</span>
              </div>
              <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight uppercase">
                {feedback.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                {feedback.desc}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2 py-4 border-y border-slate-800 max-w-md">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                    {lang === 'en' ? 'Total Typed' : 'Нийт бичсэн үсэг'}
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-200">
                    {stats.totalCharsTyped} {lang === 'en' ? 'chars' : 'тэмдэгт'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                    {lang === 'en' ? 'Correctly Typed' : 'Зөв бичсэн'}
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    {stats.correctChars} {lang === 'en' ? 'chars' : 'тэмдэгт'}
                  </span>
                </div>
              </div>

              {/* Score Submission Section */}
              <div className="mt-4 max-w-md w-full">
                {isSaved ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400">
                    <Check size={18} className="shrink-0" />
                    <span className="text-xs font-sans font-semibold">
                      {lang === 'en' 
                        ? 'Your score has been saved to the Leaderboard! 🏆' 
                        : 'Таны амжилт шилдэг уралдаанчдын самбарт бүртгэгдлээ! 🏆'}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveScore} className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col gap-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Send size={11} className="text-emerald-400" />
                      {lang === 'en' ? 'Register your score' : 'Амжилтаа самбарт бүртгүүлэх'}
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={racerName}
                        onChange={(e) => setRacerName(e.target.value)}
                        placeholder={lang === 'en' ? 'Enter racer name...' : 'Таны уралдаанчийн нэр...'}
                        disabled={isSaving}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-sans focus:outline-none focus:border-emerald-500/60 placeholder:text-slate-600 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSaving || !racerName.trim()}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-sans font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
                      >
                        {isSaving ? (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-950 border-t-transparent animate-spin" />
                        ) : (
                          <span>{lang === 'en' ? 'Save' : 'Бүртгэх'}</span>
                        )}
                      </button>
                    </div>
                    {errorMsg && (
                      <p className="text-[10px] text-red-500 font-mono font-semibold uppercase tracking-wider">
                        ⚠️ {errorMsg}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all max-w-xs self-start cursor-pointer"
              id="restart-game-btn"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>{lang === 'en' ? 'Play Again' : 'Дахин тоглох'}</span>
            </button>
          </div>

          {/* Real-time WPM Progress LineChart */}
          {history.length > 0 && (
            <div className="flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
                {lang === 'en' ? 'Speed Over Time (WPM)' : 'Хурдны өөрчлөлт (WPM)'}
              </span>
              <div className="w-full h-full min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      label={{ 
                        value: lang === 'en' ? 'Time (sec)' : 'Хугацаа (сек)', 
                        position: 'insideBottom', 
                        offset: -5, 
                        fill: '#475569', 
                        fontSize: 10 
                      }}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                      itemStyle={{ color: '#10b981' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      name="WPM"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#34d399', strokeWidth: 1, fill: '#020617' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

