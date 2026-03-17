import React from 'react';

const Security = () => {
  return (
    <section id="monitoring" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Advanced Security & Ethics</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 4rem' }}>
        Total peace of mind through real-time monitoring, compliant with Kenya's Data Protection Laws.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <div className="premium-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
          <h3>Live GPS Tracking</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Location visible only when worker is ON DUTY. Heatmap available for clients to see nearby availability 24/7.
          </p>
        </div>

        <div className="premium-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
          <h3>Legal Camera System</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Consent-based surveillance. AI flagging for theft or violence detection. Auto-delete privacy compliance.
          </p>
        </div>

        <div className="premium-card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
          <h3>Legal Protection</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Digital MOU storage, surveillance consent forms, and transparent employment classification.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Security;
