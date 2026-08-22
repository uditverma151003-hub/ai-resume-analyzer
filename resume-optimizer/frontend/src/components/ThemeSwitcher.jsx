import { useState, useEffect, useRef } from 'react';
import { Palette, Check, Moon, Sun, Sparkles } from 'lucide-react';

const themes = [
  { id: 'midnight', name: 'Midnight Cyber', color: '#0ea5e9', iconColor: 'text-sky-400', bg: 'bg-[#0b0f17]' },
  { id: 'indigo', name: 'Aurora Indigo', color: '#6366f1', iconColor: 'text-indigo-400', bg: 'bg-[#0f0c1b]' },
  { id: 'emerald', name: 'Emerald Onyx', color: '#10b981', iconColor: 'text-emerald-400', bg: 'bg-[#061412]' },
  { id: 'light', name: 'Clean Light', color: '#0284c7', iconColor: 'text-sky-600', bg: 'bg-slate-100' },
];

function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'midnight';
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition-all shadow-sm active:scale-95 min-h-[32px]"
        title="Change Theme Palette"
        aria-label="Change Theme"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: activeThemeObj.color }}
        />
        <span className="hidden sm:inline font-medium">{activeThemeObj.name}</span>
        <Palette className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-scale-up backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] uppercase font-extrabold tracking-wider text-slate-400 font-heading">
            Select Color Theme
          </div>

          <div className="space-y-0.5 mt-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setCurrentTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  currentTheme === t.id
                    ? 'bg-slate-800 text-white font-semibold shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                    style={{ backgroundColor: t.color }}
                  />
                  <span>{t.name}</span>
                </div>
                {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
