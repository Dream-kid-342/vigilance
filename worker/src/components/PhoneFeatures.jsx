import React, { useState, useEffect } from 'react';
import { Theme, Card, Button } from './UI';

const Notification = ({ message, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(onClear, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-float" style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 136, 204, 0.9)',
      padding: '1rem 2rem',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <span>🔔</span>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>New Alert</p>
        <p style={{ fontSize: '0.8rem' }}>{message}</p>
      </div>
    </div>
  );
};

const CallInterface = ({ name, onHangup }) => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '280px',
    background: Theme.colors.dark,
    border: `2px solid ${Theme.colors.secondary}`,
    borderRadius: '24px',
    padding: '1.5rem',
    textAlign: 'center',
    zIndex: 1000,
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
  }}>
    <div style={{ width: '60px', height: '60px', background: Theme.glass.bg, borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `2px solid ${Theme.colors.secondary}` }}>📞</div>
    <h4 style={{ color: 'white' }}>Calling {name}...</h4>
    <p style={{ color: Theme.colors.secondary, fontSize: '0.8rem', marginTop: '0.5rem' }}>Encrypted via Vigilance Secure</p>
    <Button onClick={onHangup} style={{ background: '#ef4444', marginTop: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Hang Up</Button>
  </div>
);

export { Notification, CallInterface };
