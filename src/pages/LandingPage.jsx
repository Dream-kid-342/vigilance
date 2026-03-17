import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Academy from '../components/Academy';
import Security from '../components/Security';

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Academy />
    <Security />
    
    <section id="revenue" style={{ padding: '8rem 2rem', textAlign: 'center', background: 'linear-gradient(to bottom, var(--bg-darker), var(--bg-dark))' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Transparent Revenue Model</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>15-25%</h1>
          <p>Commission per booking</p>
        </div>
        <div>
          <h1 style={{ color: 'var(--secondary)' }}>Subscription</h1>
          <p>For BNB / Office Clients</p>
        </div>
        <div>
          <h1 style={{ color: 'var(--accent)' }}>Sponsorship</h1>
          <p>Training fee recovery</p>
        </div>
      </div>
    </section>

    <footer style={{ borderTop: '1px solid var(--border)', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '30px', opacity: 0.5 }} />
      </div>
      <p>&copy; 2026 VIGILANCE APP. All rights reserved. Registered Data Controller (ODPC Kenya).</p>
    </footer>
  </>
);

export default LandingPage;
