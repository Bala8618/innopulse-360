import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import ThemeToggle from '../common/ThemeToggle';

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition duration-300 ease-in-out backdrop-blur ${
        isScrolled
          ? 'border-b border-slate-200/60 bg-white/90 shadow-lg dark:border-white/10 dark:bg-[#0b1120]/90'
          : 'border-b border-slate-200/40 bg-white/85 shadow-sm dark:border-white/10 dark:bg-[#0b1120]/85'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/home" className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          InnoPulse 360
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white/80 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative rounded-full px-4 py-2 transition-all duration-300 ${
                  isActive ? 'bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white' : 'hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-white/30 transition-transform duration-300 group-hover:scale-x-100" />
                </>
              )}
            </NavLink>
          ))}
          <ThemeToggle compact circle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle compact circle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-9 w-9 rounded-full border border-slate-200 bg-white text-slate-700 transition duration-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <span className="inline-flex h-full w-full items-center justify-center">
              {open ? <FiX /> : <FiMenu />}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-white/95 px-4 py-4 shadow-lg backdrop-blur dark:bg-[#0b1120]/95 md:hidden">
          <div className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition duration-300 ease-in-out ${
                    isActive ? 'bg-white/10 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
