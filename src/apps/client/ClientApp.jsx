import React from 'react';
import { Theme, Card, Button } from '../../shared/UI';

const ClientApp = () => {
  return (
    <div style={{ padding: '2rem', paddingBottom: '6rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Client Dashboard</h1>
        <p style={{ color: Theme.colors.muted }}>Find and manage your domestic workforce</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <Card style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Nearby Workers</h3>
              <p style={{ color: Theme.colors.muted }}>12 Available workers in your area</p>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card>
              <h4 style={{ marginBottom: '1rem' }}>Instant Booking</h4>
              <p style={{ fontSize: '0.9rem', color: Theme.colors.muted, marginBottom: '1.5rem' }}>Uber-style request for immediate help.</p>
              <Button style={{ width: '100%' }}>Book Now</Button>
            </Card>
            <Card>
              <h4 style={{ marginBottom: '1rem' }}>Scheduled Visit</h4>
              <p style={{ fontSize: '0.9rem', color: Theme.colors.muted, marginBottom: '1.5rem' }}>Plan ahead for weekly or monthly service.</p>
              <Button variant="outline" style={{ width: '100%' }}>Schedule</Button>
            </Card>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Active Shifts</h3>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: `1px solid ${Theme.colors.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Jane Doe</span>
                <span style={{ color: Theme.colors.primary, fontSize: '0.8rem' }}>On Site</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Started: 08:30 AM</p>
              <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: '65%', height: '100%', background: Theme.colors.primary, borderRadius: '2px' }}></div>
              </div>
              <Button variant="outline" style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}>Live GPS</Button>
            </div>
          </Card>

          <Card>
            <h3>Service History</h3>
            <p style={{ fontSize: '0.8rem', color: Theme.colors.muted, marginTop: '1rem' }}>No recent history to display.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientApp;
