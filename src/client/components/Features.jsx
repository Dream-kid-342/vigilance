import React from 'react';

const Features = () => {
  const systems = [
    {
      title: "Client App",
      target: "For Homes & Airbnb",
      features: ["Instant Booking", "Live GPS Status", "M-Pesa Integration", "Weekly/Monthly Scheduling"],
      color: "var(--primary)"
    },
    {
      title: "Worker App",
      target: "For Professionals",
      features: ["NITA Certification", "Earnings Dashboard", "Digital MOU Access", "Location Visibility Control"],
      color: "var(--secondary)"
    },
    {
      title: "Admin Control",
      target: "Command Center",
      features: ["Background Verification", "GPS Monitoring", "AI Behavior Flagging", "Revenue Analytics"],
      color: "var(--accent)"
    }
  ];

  return (
    <section id="features">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Three Systems, One Platform</h2>
        <p style={{ color: 'var(--text-muted)' }}>Tailored solutions for every stakeholder in the ecosystem.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {systems.map((s, i) => (
          <div key={i} className="premium-card">
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: s.color }}>{s.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 'bold' }}>{s.target}</p>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {s.features.map((f, fi) => (
                <li key={fi} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  marginBottom: '1rem',
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: s.color }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
