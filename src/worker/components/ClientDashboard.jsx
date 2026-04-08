import React, { useState } from 'react';
import { Theme, Card, Button } from './UI';
import { Notification, CallInterface } from './PhoneFeatures';

const ClientDashboard = ({ onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notif, setNotif] = useState(null);
  const [calling, setCalling] = useState(null);

  const categories = ["All", "Cleaning", "Gardening", "Plumbing", "Electrical", "Caretaking"];

  return (
    <div style={{ padding: '2rem', paddingBottom: '6rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Client Dashboard</h1>
          <p style={{ color: Theme.colors.muted }}>Find and manage your domestic workforce</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Button variant="outline" onClick={onLogout} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Logout</Button>
          <img src="/logo.jpeg" alt="Logo" style={{ height: '50px', borderRadius: '12px' }} />
        </div>
      </header>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '100px',
              border: `1px solid ${selectedCategory === cat ? Theme.colors.primary : Theme.glass.border}`,
              background: selectedCategory === cat ? Theme.colors.primary : Theme.glass.bg,
              color: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: '0.3s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <Card style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Nearby {selectedCategory === "All" ? "Workers" : selectedCategory + "s"}</h3>
              <p style={{ color: Theme.colors.muted }}>8 Workers active in your area</p>
            </div>
            
            {/* Mock Worker Pins */}
            <div style={{ position: 'absolute', top: '20%', left: '30%', cursor: 'pointer' }} onClick={() => setCalling("Peter Musyoka")}>
               <div style={{ background: Theme.colors.secondary, width: '10px', height: '10px', borderRadius: '50%', boxShadow: `0 0 10px ${Theme.colors.secondary}` }}></div>
               <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>Peter</span>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <Card>
              <h4 style={{ marginBottom: '1rem' }}>Instant Booking</h4>
              <p style={{ fontSize: '0.9rem', color: Theme.colors.muted, marginBottom: '1.5rem' }}>Get professional help in under 30 minutes.</p>
              <Button style={{ width: '100%' }}>Call Nearest</Button>
            </Card>
            <Card>
              <h4 style={{ marginBottom: '1rem' }}>Scheduled Visit</h4>
              <p style={{ fontSize: '0.9rem', color: Theme.colors.muted, marginBottom: '1.5rem' }}>Plan for recurrent weekly/monthly services.</p>
              <Button variant="outline" style={{ width: '100%' }}>Book Calendar</Button>
            </Card>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1.5rem' }}>On Site Now</h3>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px solid ${Theme.colors.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Jane Wambui</span>
                <span style={{ color: Theme.colors.secondary, fontSize: '0.8rem' }}>Active</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>Started: 10:00 AM • Karen Suburbs</p>
              <div style={{ marginTop: '1.5rem', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                <div style={{ width: '45%', height: '100%', background: Theme.colors.primary, borderRadius: '3px' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                 <Button variant="outline" style={{ flex: 1, padding: '0.5rem' }} onClick={() => setCalling("Jane Wambui")}>Call</Button>
                 <Button style={{ flex: 1, padding: '0.5rem' }}>Track GPS</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
