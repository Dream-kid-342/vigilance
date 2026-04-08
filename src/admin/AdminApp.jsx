import React from 'react';
import { Theme, Card, Button } from '../shared/UI';

const AdminApp = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Command Center</h1>
          <p style={{ color: Theme.colors.muted }}>Global Monitoring & Infrastructure Management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline">Systems Health</Button>
          <Button>Security Overdrive</Button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: "Active Workers", value: "2,841", color: Theme.colors.primary },
          { label: "Pending NITA", value: "156", color: Theme.colors.accent },
          { label: "Safety Alerts", value: "0", color: Theme.colors.secondary },
          { label: "Daily Revenue", value: "KSh 145K", color: Theme.colors.primary }
        ].map((stat, i) => (
          <Card key={i} style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, opacity: 0.6 }}>{stat.label}</p>
            <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', color: stat.color }}>{stat.value}</h2>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Verification Pipeline</h3>
            <span style={{ color: Theme.colors.primary, fontSize: '0.8rem', cursor: 'pointer' }}>View All</span>
          </div>
          {[
            { name: "Grace Njeri", status: "ID Uploaded", time: "12m ago" },
            { name: "Samuel Kamau", status: "Training Complete", time: "45m ago" },
            { name: "Beth Maina", status: "NITA Scheduled", time: "1h ago" }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: i < 2 ? `1px solid ${Theme.glass.border}` : 'none' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: '0.7rem', color: Theme.colors.primary }}>{item.status}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>{item.time}</span>
            </div>
          ))}
        </Card>

        <Card>
          <h3>GPS Security Heatmap</h3>
          <div style={{ height: '240px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: `1px solid ${Theme.glass.border}`, marginTop: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '20%', left: '30%', width: '12px', height: '12px', background: Theme.colors.secondary, borderRadius: '50%', boxShadow: `0 0 10px ${Theme.colors.secondary}` }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '60%', width: '12px', height: '12px', background: Theme.colors.primary, borderRadius: '50%', boxShadow: `0 0 10px ${Theme.colors.primary}` }}></div>
            <div style={{ position: 'absolute', top: '70%', left: '40%', width: '12px', height: '12px', background: Theme.colors.accent, borderRadius: '50%', boxShadow: `0 0 10px ${Theme.colors.accent}` }}></div>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
              Active Sensors: 342
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminApp;
