import React from 'react';
import { Theme, Card, Button } from '../../shared/UI';

const WorkerApp = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Worker Hub</h1>
          <p style={{ color: Theme.colors.muted }}>Manage your profile and assignments</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: Theme.glass.bg, padding: '0.5rem 1rem', borderRadius: '100px', border: `1px solid ${Theme.glass.border}` }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status: Available</span>
          <div style={{ width: '40px', height: '20px', background: Theme.colors.secondary, borderRadius: '10px', position: 'relative' }}>
            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', background: Theme.glass.bg, borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: `2px solid ${Theme.colors.primary}` }}>👤</div>
              <h3>Peter Musyoka</h3>
              <p style={{ color: Theme.colors.muted, fontSize: '0.8rem' }}>Professional Gardener</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ color: Theme.colors.accent }}>★★★★★</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>4.9</span>
            </div>
            <Button variant="outline" style={{ width: '100%' }}>Edit Profile</Button>
          </Card>

          <Card>
            <h4 style={{ marginBottom: '1rem' }}>Certifications</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ color: Theme.colors.secondary }}>✓</span>
              <span style={{ fontSize: '0.9rem' }}>NITA Certificate Verified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: Theme.colors.secondary }}>✓</span>
              <span style={{ fontSize: '0.9rem' }}>Safety Training Level 1</span>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card style={{ borderLeft: `4px solid ${Theme.colors.primary}` }}>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Current Earnings</p>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>KES 4,200</h2>
              <p style={{ fontSize: '0.7rem', color: Theme.colors.primary }}>+15% from last week</p>
            </Card>
            <Card style={{ borderLeft: `4px solid ${Theme.colors.secondary}` }}>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Total Jobs</p>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>32</h2>
              <p style={{ fontSize: '0.7rem', color: Theme.colors.secondary }}>Top 5% in Nairobi</p>
            </Card>
          </div>

          <Card style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Requests</h3>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: Theme.colors.muted }}>No job requests currently.</p>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.primary, marginTop: '0.5rem' }}>Toggle status to "Available" to receive jobs.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerApp;
