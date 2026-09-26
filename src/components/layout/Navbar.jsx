import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Scale, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuthContext.jsx';

const navItems = [
  { to: '/',        label: 'Home'    },
  { to: '/analyze', label: 'Analyze' },
  { to: '/compare', label: 'Compare' },
  { to: '/qa',      label: 'Q&A'     },
];

export default function Navbar() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="navbar-glass fixed top-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2" aria-label="LexAI home">
          <Scale
            className="h-6 w-6 text-neon-indigo"
            aria-hidden="true"
            style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' }}
          />
          <span className="font-heading text-xl font-bold neon-glow text-text-primary">
            LexAI
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex" role="menubar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role="menuitem"
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo',
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

        {/* Right side — version + auth */}
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-text-muted sm:inline" aria-hidden="true">
            [v1.0.0]
          </span>

          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" aria-label="Loading authentication" />
          ) : user ? (
            /* ── Signed in ── */
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label={`Account menu for ${user.displayName || user.email}`}
                className="flex items-center gap-2 rounded-lg border border-neon-indigo/30 bg-neon-indigo/10 px-3 py-2 text-xs font-medium text-neon-indigo transition-all hover:bg-neon-indigo/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5 rounded-full"
                  />
                )}
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Account options"
                  className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0f0f19] shadow-xl"
                >
                  <div className="border-b border-white/5 px-4 py-3">
                    <p className="truncate text-xs font-medium text-text-primary">
                      {user.displayName}
                    </p>
                    <p className="truncate text-[10px] text-text-muted">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-risk-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Signed out ── */
            <button
              onClick={signInWithGoogle}
              aria-label="Sign in with Google"
              className="flex items-center gap-1.5 rounded-lg border border-neon-indigo/30 bg-neon-indigo/10 px-3 py-2 text-xs font-medium text-neon-indigo transition-all hover:bg-neon-indigo/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className="flex items-center justify-center gap-2 border-t border-white/5 px-4 py-2 md:hidden"
        role="menubar"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            role="menuitem"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-indigo',
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
