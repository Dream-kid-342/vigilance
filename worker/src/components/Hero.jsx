import React from 'react';

const Hero = () => {
  return (
    <section id="hero" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      textAlign: 'center',
      paddingTop: '8rem'
    }}>
      <div style={{
        padding: '0.5rem 1rem',
        background: 'rgba(0, 136, 204, 0.1)',
        border: '1px solid var(--primary)',
        borderRadius: '100px',
        color: 'var(--primary)',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginBottom: '2rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        The Future of Domestic Workforce
      </div>
      
      <h1 className="gradient-text" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '900px' }}>
        Smart Workforce Marketplace <br/> & Monitoring Ecosystem
      </h1>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '3rem' }}>
        Recruiting, certifying, and monitoring Kenya's local workforce through advanced GPS tracking and AI-powered security.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '1.2rem 2.5rem' }}>Hire a Worker</button>
        <button style={{ 
          background: 'none', 
          border: '1px solid var(--border)', 
          color: 'var(--text-main)', 
          padding: '1.2rem 2.5rem', 
          borderRadius: '12px', 
          fontWeight: '600',
          fontSize: '1.1rem',
          cursor: 'pointer'
        }}>Join as Worker</button>
      </div>

      <div className="animate-float" style={{ marginTop: '5rem', width: '100%', maxWidth: '1000px' }}>
        <img src="/src/assets/prompt.jpeg" alt="System Map" style={{ 
          width: '100%', 
          borderRadius: '32px', 
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          border: '1px solid var(--border)'
        }} />
      </div>
    </section>
  );
};

export default Hero;
