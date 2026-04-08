import React, { createContext, useContext, useState, useEffect } from 'react';

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const dark = {
  name: 'dark',
  bg: '#0a0f1e',
  surface: '#111827',
  surfaceAlt: '#1a2235',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryGlow: 'rgba(59,130,246,0.25)',
  secondary: '#10b981',
  secondaryGlow: 'rgba(16,185,129,0.2)',
  accent: '#f59e0b',
  danger: '#ef4444',
  glass: 'rgba(255,255,255,0.04)',
  shadow: '0 4px 24px rgba(0,0,0,0.4)',
  shadowLg: '0 16px 48px rgba(0,0,0,0.6)',
};

const light = {
  name: 'light',
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#f1f5f9',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.16)',
  text: '#0f172a',
  textMuted: '#475569',
  textSubtle: '#94a3b8',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryGlow: 'rgba(37,99,235,0.15)',
  secondary: '#059669',
  secondaryGlow: 'rgba(5,150,105,0.15)',
  accent: '#d97706',
  danger: '#dc2626',
  glass: 'rgba(0,0,0,0.02)',
  shadow: '0 4px 24px rgba(0,0,0,0.08)',
  shadowLg: '0 16px 48px rgba(0,0,0,0.12)',
};

/* ─── CONTEXT ────────────────────────────────────────────────── */
export const ThemeContext = createContext({ theme: dark, toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('vg-theme') !== 'light'; } catch { return true; }
  });

  const theme = isDark ? dark : light;

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('vg-theme', next ? 'dark' : 'light'); } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ─── THEME TOGGLE BUTTON ────────────────────────────────────── */
export const ThemeToggle = () => {
  const { isDark, toggleTheme, theme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: '40px', height: '40px', borderRadius: '10px',
        border: `1px solid ${theme.border}`,
        background: theme.surfaceAlt,
        color: theme.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

/* ─── CARD ───────────────────────────────────────────────────── */
export const Card = ({ children, style, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div
      className={`vg-card ${className}`}
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: theme.shadow,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─── BUTTON ─────────────────────────────────────────────────── */
export const Button = ({ children, variant = 'primary', size = 'md', style, disabled, ...props }) => {
  const { theme } = useTheme();

  const sizes = {
    sm: { padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '8px' },
    md: { padding: '0.7rem 1.5rem', fontSize: '0.9rem', borderRadius: '10px' },
    lg: { padding: '0.9rem 2rem', fontSize: '1rem', borderRadius: '12px' },
  };

  const variants = {
    primary: {
      background: theme.primary,
      color: '#fff',
      border: 'none',
      boxShadow: `0 2px 12px ${theme.primaryGlow}`,
    },
    secondary: {
      background: theme.secondary,
      color: '#fff',
      border: 'none',
      boxShadow: `0 2px 12px ${theme.secondaryGlow}`,
    },
    outline: {
      background: 'transparent',
      color: theme.text,
      border: `1px solid ${theme.border}`,
    },
    danger: {
      background: theme.danger,
      color: '#fff',
      border: 'none',
    },
    ghost: {
      background: theme.glass,
      color: theme.text,
      border: `1px solid ${theme.border}`,
    },
  };

  return (
    <button
      disabled={disabled}
      style={{
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.18s ease',
        whiteSpace: 'nowrap',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

/* ─── BADGE ──────────────────────────────────────────────────── */
export const Badge = ({ children, color = 'primary', style }) => {
  const { theme } = useTheme();
  const map = {
    primary: { bg: theme.primaryGlow, color: theme.primary },
    green: { bg: theme.secondaryGlow, color: theme.secondary },
    yellow: { bg: 'rgba(245,158,11,0.15)', color: theme.accent },
    red: { bg: 'rgba(239,68,68,0.15)', color: theme.danger },
    muted: { bg: theme.surfaceAlt, color: theme.textMuted },
  };
  const c = map[color] || map.primary;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.65rem', borderRadius: '20px',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em',
      background: c.bg, color: c.color,
      ...style,
    }}>
      {children}
    </span>
  );
};

/* ─── INPUT ──────────────────────────────────────────────────── */
export const Input = ({ style, ...props }) => {
  const { theme } = useTheme();
  return (
    <input
      style={{
        width: '100%', padding: '0.75rem 1rem',
        borderRadius: '10px', fontFamily: 'inherit', fontSize: '0.9rem',
        background: theme.surfaceAlt,
        border: `1px solid ${theme.border}`,
        color: theme.text, outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = theme.primary}
      onBlur={e => e.target.style.borderColor = theme.border}
      {...props}
    />
  );
};

/* ─── DIVIDER ────────────────────────────────────────────────── */
export const Divider = ({ style }) => {
  const { theme } = useTheme();
  return <div style={{ height: '1px', background: theme.border, margin: '1rem 0', ...style }} />;
};

/* ─── STAT CARD ──────────────────────────────────────────────── */
export const StatCard = ({ label, value, icon, color = 'primary', style }) => {
  const { theme } = useTheme();
  const colorMap = {
    primary: theme.primary,
    green: theme.secondary,
    yellow: theme.accent,
    red: theme.danger,
  };
  return (
    <Card style={{ padding: '1.2rem 1.5rem', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</p>
          <p style={{ margin: '0.3rem 0 0', fontSize: '1.6rem', fontWeight: 800, color: theme.text, lineHeight: 1 }}>{value}</p>
        </div>
        {icon && (
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: colorMap[color] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

/* ─── AVATAR ─────────────────────────────────────────────────── */
export const Avatar = ({ src, name, size = 48, verified = false, style }) => {
  const { theme } = useTheme();
  const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'U')}&backgroundColor=3b82f6&textColor=ffffff`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      <img
        src={src || fallback}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.border}`, background: theme.surfaceAlt }}
        onError={e => { e.target.src = fallback; }}
      />
      {verified && (
        <span style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, background: theme.primary, borderRadius: '50%', border: `2px solid ${theme.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#fff', fontWeight: 700 }}>✓</span>
      )}
    </div>
  );
};

/* ─── SECTION HEADER ─────────────────────────────────────────── */
export const SectionHeader = ({ title, subtitle, right, style }) => {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap', ...style }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: theme.text }}>{title}</h3>
        {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: theme.textMuted }}>{subtitle}</p>}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
};

/* ─── LEGACY COMPAT (for files that still import Theme) ──────── */
export const Theme = {
  colors: {
    primary: dark.primary, secondary: dark.secondary, accent: dark.accent,
    dark: dark.surface, darker: dark.bg, text: dark.text, muted: dark.textMuted,
  },
  glass: { bg: dark.glass, border: dark.border, blur: 'blur(12px)' },
};
