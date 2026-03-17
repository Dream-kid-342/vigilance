import React from 'react';

export const Theme = {
  colors: {
    primary: '#0088cc',
    secondary: '#4ade80',
    accent: '#facc15',
    dark: '#0f172a',
    darker: '#020617',
    text: '#f8fafc',
    muted: '#94a3b8'
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 'blur(12px)'
  }
};

export const Card = ({ children, style, hover = true }) => (
  <div className={hover ? "premium-card" : ""} style={{
    background: Theme.glass.bg,
    backdropFilter: Theme.glass.blur,
    border: `1px solid ${Theme.glass.border}`,
    borderRadius: '24px',
    padding: '2rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style
  }}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', style, ...props }) => {
  const baseStyle = {
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };
  
  const variants = {
    primary: {
      background: Theme.colors.primary,
      color: 'white',
      boxShadow: '0 4px 14px rgba(0, 136, 204, 0.4)',
    },
    outline: {
      background: 'none',
      border: `1px solid ${Theme.glass.border}`,
      color: Theme.colors.text,
    }
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
};
