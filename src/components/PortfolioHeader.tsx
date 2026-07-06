import React, { useState, useEffect } from 'react';
import { ExternalLink, Edit2, Check, Mail, Github, ArrowUpRight, Trophy, Keyboard, Menu, X } from 'lucide-react';

interface PortfolioHeaderProps {
  themeColor: 'emerald' | 'cyan' | 'amber' | 'crimson';
}

const THEME_ACCENTS = {
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/10 hover:text-emerald-400',
    btnBg: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
    accentText: 'text-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
    hoverBg: 'hover:bg-cyan-500/10 hover:text-cyan-400',
    btnBg: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
    accentText: 'text-cyan-500',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]'
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/10 hover:text-amber-400',
    btnBg: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    accentText: 'text-amber-500',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
  },
  crimson: {
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    hoverBg: 'hover:bg-rose-500/10 hover:text-rose-400',
    btnBg: 'bg-rose-500 text-slate-950 hover:bg-rose-400',
    accentText: 'text-rose-500',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]'
  }
};

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({ themeColor }) => {
  const [vercelUrl, setVercelUrl] = useState('https://typeracer-mn.vercel.app');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = THEME_ACCENTS[themeColor] || THEME_ACCENTS.emerald;

  // Load saved Vercel URL from localStorage if any
  useEffect(() => {
    const savedUrl = localStorage.getItem('typeracer_vercel_url');
    if (savedUrl) {
      setVercelUrl(savedUrl);
    }
  }, []);

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTempUrl(vercelUrl);
    setIsEditingUrl(true);
  };

  const saveUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let formattedUrl = tempUrl.trim();
    if (formattedUrl) {
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      setVercelUrl(formattedUrl);
      localStorage.setItem('typeracer_vercel_url', formattedUrl);
    }
    setIsEditingUrl(false);
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-slate-950/70 backdrop-blur-md border-b border-slate-900 px-6 py-4" id="portfolio-navbar">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-850 to-slate-950 border border-slate-800 flex items-center justify-center font-mono font-black text-xs text-white">
            HA
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-sans font-black tracking-tight text-white uppercase">
              Huslen Altanshuh
            </span>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
              Portfolio & Projects
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleScrollTo('typeracer-core')}
            className="text-xs font-sans font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            🏠 Home
          </button>
          
          <button
            onClick={() => handleScrollTo('leaderboard-section')}
            className="text-xs font-sans font-bold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trophy size={12} />
            Leaderboard
          </button>

          {/* Customizable Vercel Tab Link */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-xl group relative">
            {isEditingUrl ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-emerald-500/50 w-44 font-mono"
                  placeholder="https://..."
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={saveUrl}
                  className="p-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  title="Save URL"
                >
                  <Check size={11} />
                </button>
              </div>
            ) : (
              <>
                <a
                  href={vercelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.text} hover:opacity-80 transition-all`}
                >
                  <span>⌨️ Typeracer</span>
                  <ExternalLink size={12} className="opacity-60" />
                </a>

                {/* Edit Button */}
                <button
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-all ml-1"
                  title="Edit Vercel Link"
                >
                  <Edit2 size={11} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="mailto:huslenaltanshuhk@gmail.com"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            title="Email Me"
          >
            <Mail size={14} />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            title="GitHub Portfolio"
          >
            <Github size={14} />
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-900 flex flex-col gap-4 animate-fadeIn">
          <button
            onClick={() => handleScrollTo('typeracer-core')}
            className="text-xs font-sans font-bold text-slate-400 hover:text-white py-2 text-left"
          >
            🏠 Home
          </button>
          
          <button
            onClick={() => handleScrollTo('leaderboard-section')}
            className="text-xs font-sans font-bold text-slate-400 hover:text-white py-2 text-left flex items-center gap-1.5"
          >
            <Trophy size={13} />
            Leaderboard
          </button>

          {/* Vercel tab */}
          <div className="py-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <a
                href={vercelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 ${theme.text}`}
              >
                <span>⌨️ Typeracer</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>

              <button
                onClick={startEditing}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Edit Vercel Link"
              >
                <Edit2 size={11} />
              </button>
            </div>

            {isEditingUrl && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
                  placeholder="https://..."
                />
                <button
                  onClick={saveUrl}
                  className="px-3 py-1.5 rounded bg-emerald-500 text-slate-950 text-xs font-sans font-bold"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-900/60">
            <a
              href="mailto:huslenaltanshuhk@gmail.com"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans font-bold text-slate-300"
            >
              <Mail size={13} />
              Email Me
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans font-bold text-slate-300"
            >
              <Github size={13} />
              GitHub
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
export default PortfolioHeader;
