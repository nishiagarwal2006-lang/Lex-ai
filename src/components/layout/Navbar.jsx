import { NavLink } from 'react-router-dom';
import { Scale, KeyRound } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/compare', label: 'Compare' },
  { to: '/qa', label: 'Q&A' },
];

export default function Navbar() {
  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-neon-indigo" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' }} />
          <span className="font-heading text-xl font-bold neon-glow text-text-primary">
            LexAI
          </span>
        </NavLink>

        {/* Center nav */}
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-neon-indigo/15 text-neon-indigo border border-neon-indigo/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-text-muted sm:inline">[v1.0.0]</span>
          <a
            href="https://x.ai/api"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-neon-indigo/30 bg-neon-indigo/10 px-3 py-2 text-xs font-medium text-neon-indigo transition-all hover:bg-neon-indigo/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Get API Key
          </a>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex items-center justify-center gap-2 border-t border-white/5 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'bg-neon-indigo/15 text-neon-indigo'
                  : 'text-text-secondary hover:text-text-primary'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
