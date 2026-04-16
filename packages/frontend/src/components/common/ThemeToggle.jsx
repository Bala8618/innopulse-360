import { FiMoon, FiMonitor, FiSun } from 'react-icons/fi';
import useTheme, { cycleTheme } from '../../hooks/useTheme';

export default function ThemeToggle({ compact = false, circle = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    setTheme(cycleTheme(theme));
  };

  const label = theme === 'auto'
    ? `Auto (${resolvedTheme})`
    : (theme === 'dark' ? 'Dark' : 'Light');
  const Icon = theme === 'dark' ? FiMoon : theme === 'light' ? FiSun : FiMonitor;

  const isDark = theme === 'dark' || (theme === 'auto' && resolvedTheme === 'dark');
  const isLight = theme === 'light' || (theme === 'auto' && resolvedTheme === 'light');

  return (
    <button
      onClick={toggle}
      className={`border border-white/10 bg-white/5 text-slate-700 dark:text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${circle ? 'h-9 w-9 rounded-full p-0' : 'rounded-2xl px-3 py-2 text-xs font-semibold'} ${compact ? 'px-2 py-2' : ''} ${isDark ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-200 ring-2 ring-indigo-400/70 shadow-[0_0_18px_rgba(99,102,241,0.6)]' : ''} ${isLight ? 'border-slate-300 bg-white text-slate-700 ring-2 ring-slate-300/70 shadow-[0_0_12px_rgba(148,163,184,0.5)]' : ''}`}
      type="button"
      title="Toggle theme: Auto -> Light -> Dark"
    >
      <span className={`inline-flex items-center ${circle ? 'justify-center' : 'gap-2'}`}>
        <Icon className="text-base drop-shadow-sm text-current" />
        {!compact && <>Theme: {label}</>}
      </span>
    </button>
  );
}
