import React from 'react';

const Academy = () => {
  return (
    <section id="recruitment" style={{ background: 'var(--bg-dark)', borderRadius: '48px', margin: '4rem auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Vigilance Training Academy</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            We don't just hire; we empower. Our academy provides structured training and certification for the next generation of domestic workers.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Skilled Professionals</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Must sit for NITA assessment exams. Verified certificates are required for "Approved" status.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Unskilled Talents</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Company-funded training with a 5-year MOU agreement. Salary deduction structure available to cover costs.</p>
          </div>
          
          <button className="btn-primary">Explore Academy</button>
        </div>
        
        <div style={{ flex: '1 1 400px', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Certification Pipeline</h3>
          {[
            { step: "01", label: "Registration & ID Upload" },
            { step: "02", label: "Background Verification" },
            { step: "03", label: "Academy Enrollment" },
            { step: "04", label: "NITA Assessment" },
            { step: "05", label: "Vigilance Certification" }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', opacity: 0.3 }}>{item.step}</span>
              <span style={{ fontWeight: '600' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Academy;
