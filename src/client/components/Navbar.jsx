import React from 'react';

const Navbar = () => {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1000,
      background: 'rgba(2, 6, 23, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/logo.jpeg" alt="Vigilance Logo" style={{ height: '40px', borderRadius: '8px' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--primary)' }}>VIGILANCE</span>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <a href="/client" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>Client Portal</a>
        <a href="/worker" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>Worker Portal</a>
        <a href="/admin" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>Admin Control</a>
        <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Join Now</button>
      </div>
    </nav>
  );
};

export default Navbar;
