import TyperacerGame from './components/TyperacerGame';
import PortfolioHeader from './components/PortfolioHeader';

export default function App() {
  return (
    <div className="min-h-screen bg-[#060a13] text-slate-100 flex flex-col justify-between relative overflow-hidden" id="app-root-container">
      {/* Dynamic atmospheric decoration glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Portfolio Header with customizable '⌨️ Typeracer' Vercel Tab */}
      <PortfolioHeader themeColor="emerald" />

      {/* Main Game Interface */}
      <main className="flex-1 flex items-center justify-center py-10 relative z-10 w-full">
        <TyperacerGame />
      </main>

      {/* Minimalist Footer */}
      <footer className="w-full py-6 border-t border-slate-900 bg-slate-950/40 text-xs text-slate-500 font-sans relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>Typeracer Монгол © {new Date().getFullYear()}</span>
          <span className="flex items-center gap-1.5">
            Бүтээн байгуулсан: <span className="text-emerald-400 font-medium">AI Studio Build</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
