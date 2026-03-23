import React, { useEffect } from 'react';
import { useTheme } from './UI';

/* ── TOAST NOTIFICATION ─────────────────────────────────────── */
export const Notification = ({ message, title, onClear, type = 'info' }) => {
  const { theme } = useTheme();

  useEffect(() => {
    const t = setTimeout(onClear, 5500);
    return () => clearTimeout(t);
  }, [message]);

  const icons = {
    info:    '🔔',
    success: '✅',
    warning: '⚠️',
    error:   '❌',
  };

  const accentMap = {
    info:    theme.primary,
    success: theme.secondary,
    warning: theme.accent,
    error:   theme.danger,
  };

  const detectedType =
    message?.startsWith('✅') ? 'success' :
    message?.startsWith('❌') ? 'error' :
    message?.startsWith('⚠️') ? 'warning' : 'info';

  const resolvedType = type !== 'info' ? type : detectedType;
  const accent = accentMap[resolvedType];
  const icon = icons[resolvedType];
  const cleanMsg = message?.replace(/^[✅❌⚠️🔔📢🎉📷]\s?/, '') || message;

  return (
    <div className="fade-in" style={{
      position: 'fixed', top: '1rem', right: '1rem',
      minWidth: '280px', maxWidth: '360px',
      background: theme.surface,
      border: `1px solid ${theme.borderStrong}`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      boxShadow: theme.shadowLg,
      zIndex: 10000,
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    }}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.05rem' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <p style={{ fontWeight: 700, fontSize: '0.85rem', color: theme.text, margin: '0 0 0.15rem' }}>{title}</p>}
        <p style={{ fontSize: '0.82rem', color: theme.textMuted, margin: 0, lineHeight: 1.4 }}>{cleanMsg}</p>
      </div>
      <button
        onClick={onClear}
        style={{ background: 'none', border: 'none', color: theme.textSubtle, cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0 0 0 0.25rem' }}
      >✕</button>
    </div>
  );
};

/* ── CALL INTERFACE ─────────────────────────────────────────── */
export const CallInterface = ({ name, onHangup }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      position: 'fixed', bottom: '5rem', right: '1rem',
      width: '260px',
      background: theme.surface,
      border: `1px solid ${theme.secondary}`,
      borderRadius: '20px',
      padding: '1.5rem',
      textAlign: 'center',
      zIndex: 10000,
      boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${theme.secondaryGlow}`,
    }}>
      <div style={{
        width: '56px', height: '56px',
        background: `${theme.secondary}20`,
        borderRadius: '50%',
        margin: '0 auto 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
        border: `2px solid ${theme.secondary}`,
      }}>📞</div>
      <p style={{ fontWeight: 700, color: theme.text, marginBottom: '0.25rem' }}>{name}</p>
      <p style={{ fontSize: '0.75rem', color: theme.secondary, marginBottom: '1.25rem' }}>Encrypted via Vigilance</p>
      <button
        onClick={onHangup}
        style={{ background: theme.danger, color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
      >
        Hang Up
      </button>
    </div>
  );
};
