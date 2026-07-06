import React, { useState, useEffect } from 'react';
import { ScoreRecord, getTopScores, isCloudSyncEnabled } from '../lib/firebase';
import { Trophy, Clock, Target, ShieldAlert, Wifi, WifiOff, Globe } from 'lucide-react';

interface LeaderboardProps {
  lang: 'mn' | 'en';
  themeColor: 'emerald' | 'cyan' | 'amber' | 'crimson';
  refreshTrigger: number;
}

const THEME_ACCENTS = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-600 text-slate-950',
    accentText: 'text-emerald-500'
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
    badge: 'bg-cyan-600 text-slate-950',
    accentText: 'text-cyan-500'
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    badge: 'bg-amber-600 text-slate-950',
    accentText: 'text-amber-500'
  },
  crimson: {
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    badge: 'bg-rose-600 text-slate-950',
    accentText: 'text-rose-500'
  }
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ lang, themeColor, refreshTrigger }) => {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [activeLangFilter, setActiveLangFilter] = useState<'mn' | 'en'>(lang);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);

  const theme = THEME_ACCENTS[themeColor];

  const fetchScores = async () => {
    setLoading(true);
    try {
      const topScores = await getTopScores(activeLangFilter);
      setScores(topScores);
      setIsCloud(isCloudSyncEnabled());
    } catch (error) {
      console.error('Failed to load leaderboard scores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync active language filter with game language on mount or game restart
  useEffect(() => {
    setActiveLangFilter(lang);
  }, [lang]);

  // Fetch scores when language filter, game language, or refreshTrigger updates
  useEffect(() => {
    fetchScores();
  }, [activeLangFilter, refreshTrigger]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <section className="w-full p-6 md:p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 shadow-xl" id="leaderboard-section">
      {/* Leaderboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="text-lg font-sans font-black tracking-tight text-white uppercase">
              {lang === 'en' ? 'TOP 10 LEADERBOARD' : 'ШИЛДЭГ 10 ТЭРГҮҮЛЭГЧИД'}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              {lang === 'en' ? 'Fastest typists on the track' : 'Хамгийн хурдан бичдэг уралдаанчид'}
            </p>
          </div>
        </div>

        {/* Sync Mode Badge and Language Filters */}
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          {/* Firestore Connection Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${
            isCloud 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`} title={isCloud ? 'Connected to Cloud Firestore' : 'Saved in Local Storage'}>
            {isCloud ? <Wifi size={11} className="animate-pulse" /> : <WifiOff size={11} />}
            <span>{isCloud ? 'Firestore (Cloud)' : 'Local Storage'}</span>
          </div>

          {/* MN / EN filter toggle */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveLangFilter('mn')}
              className={`px-3 py-1 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLangFilter === 'mn'
                  ? `${theme.badge} shadow-md`
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              MN
            </button>
            <button
              onClick={() => setActiveLangFilter('en')}
              className={`px-3 py-1 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeLangFilter === 'en'
                  ? `${theme.badge} shadow-md`
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table / List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className={`w-8 h-8 rounded-full border-2 border-t-transparent ${theme.accentText} animate-spin`} />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
            {lang === 'en' ? 'Fetching scores...' : 'Тэргүүлэгчдийг уншиж байна...'}
          </span>
        </div>
      ) : scores.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
          <span className="text-2xl">🏁</span>
          <span className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'en' ? 'No scores recorded yet' : 'Одоогоор бичигдсэн амжилт алга'}
          </span>
          <p className="text-[10px] text-slate-500 max-w-xs px-4">
            {lang === 'en' 
              ? 'Complete a typing race and save your name to become the first on the board!' 
              : 'Уралдаанаа дуусгаад өөрийн нэрээ бүртгүүлж анхны тэргүүлэгч болоорой!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" id="leaderboard-scores-container">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-2 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase border-b border-slate-800/40">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4 sm:col-span-5">{lang === 'en' ? 'RACER NAME' : 'УРАЛДААНЧИЙН НЭР'}</div>
            <div className="col-span-2 text-right">{lang === 'en' ? 'SPEED' : 'ХУРД'}</div>
            <div className="col-span-2 text-right">{lang === 'en' ? 'ACCURACY' : 'НАРИЙВЧЛАЛ'}</div>
            <div className="col-span-3 sm:col-span-2 text-right">{lang === 'en' ? 'COMPLETED' : 'ХУГАЦАА'}</div>
          </div>

          {/* Scores rows */}
          <div className="flex flex-col gap-1.5 mt-2">
            {scores.map((record, index) => {
              const rank = index + 1;
              let rankBadge = '';
              let rowBg = 'bg-slate-950/20 hover:bg-slate-900/30';
              let borderCol = 'border-slate-800/40';

              if (rank === 1) {
                rankBadge = '🥇';
                rowBg = 'bg-amber-500/5 hover:bg-amber-500/10';
                borderCol = 'border-amber-500/20';
              } else if (rank === 2) {
                rankBadge = '🥈';
                rowBg = 'bg-slate-300/5 hover:bg-slate-300/10';
                borderCol = 'border-slate-400/20';
              } else if (rank === 3) {
                rankBadge = '🥉';
                rowBg = 'bg-orange-700/5 hover:bg-orange-700/10';
                borderCol = 'border-orange-600/20';
              }

              return (
                <div
                  key={record.id || index}
                  className={`grid grid-cols-12 items-center px-4 py-3.5 rounded-xl border ${borderCol} ${rowBg} transition-all duration-200`}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center font-mono font-black text-sm text-slate-400 flex items-center justify-center">
                    {rankBadge ? <span className="text-lg">{rankBadge}</span> : <span>{rank}</span>}
                  </div>

                  {/* Name */}
                  <div className="col-span-4 sm:col-span-5 font-sans font-bold text-slate-200 truncate pr-2 flex items-center gap-1.5">
                    <span className="truncate">{record.name}</span>
                    {record.wpm >= 80 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono" title="Speed typing guru">
                        PRO
                      </span>
                    )}
                  </div>

                  {/* WPM */}
                  <div className="col-span-2 text-right font-mono font-black text-white">
                    <span className={rank <= 3 ? theme.text : 'text-slate-100'}>{record.wpm}</span>
                    <span className="text-[9px] text-slate-500 ml-0.5">WPM</span>
                  </div>

                  {/* Accuracy */}
                  <div className="col-span-2 text-right font-mono text-xs text-slate-300">
                    {record.accuracy}%
                  </div>

                  {/* Completed time / date */}
                  <div className="col-span-3 sm:col-span-2 text-right font-mono text-[10px] text-slate-500">
                    {formatDate(record.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
export default Leaderboard;
