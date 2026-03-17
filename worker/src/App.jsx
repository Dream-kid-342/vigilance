import React, { useState } from 'react';
import { Theme, Card, Button } from './components/UI';
import { Notification, CallInterface } from './components/PhoneFeatures';

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [onDuty, setOnDuty] = useState(false);
  const [notif, setNotif] = useState(null);
  const [calling, setCalling] = useState(null);

  const categories = ["Cleaning", "Gardening", "Plumbing", "Electrical", "Caretaking"];

  const handleToggleDuty = () => {
    setOnDuty(!onDuty);
    if (!onDuty && selectedCategory) {
      setNotif(`You are now live in ${selectedCategory}! Waiting for nearby clients...`);
    }
  };

  const handleLogout = () => {
     // Simple mock logout - normally would go to signup/login
     window.location.reload();
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: Theme.colors.darker, color: Theme.colors.text }}>
      {notif && <Notification message={notif} onClear={() => setNotif(null)} />}
      {calling && <CallInterface name={calling} onHangup={() => setCalling(null)} />}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Worker Hub</h1>
          <p style={{ color: Theme.colors.muted }}>Select your expertise and find jobs</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Button variant="outline" onClick={handleLogout} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Logout</Button>
          <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: '40px', borderRadius: '8px' }} />
        </div>
      </header>

      {!selectedCategory ? (
        <Card style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>What service are you offering today?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {categories.map(cat => (
              <Button key={cat} variant="outline" onClick={() => setSelectedCategory(cat)} style={{ minWidth: '150px' }}>
                {cat}
              </Button>
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{selectedCategory} Mode</h3>
                <Button variant="outline" onClick={() => { setSelectedCategory(null); setOnDuty(false); }} style={{ fontSize: '0.7rem', padding: '0.4rem' }}>Change</Button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: `1px solid ${onDuty ? Theme.colors.secondary : Theme.colors.muted}` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{onDuty ? "On Duty" : "Off Duty"}</p>
                  <p style={{ fontSize: '0.7rem', color: Theme.colors.muted }}>{onDuty ? "Clients can see you" : "Location hidden"}</p>
                </div>
                <div 
                  onClick={handleToggleDuty} 
                  style={{ width: '50px', height: '26px', background: onDuty ? Theme.colors.secondary : '#334155', borderRadius: '13px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}
                >
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', left: onDuty ? '26px' : '3px', top: '3px', transition: '0.3s' }}></div>
                </div>
              </div>
            </Card>

            <Card style={{ borderLeft: `4px solid ${Theme.colors.primary}` }}>
              <h3>Earnings</h3>
              <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>KES 12,450</h2>
              <p style={{ fontSize: '0.8rem', color: Theme.colors.muted }}>This Month • 14 Jobs</p>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <Card style={{ height: '450px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ textAlign: 'center', opacity: onDuty ? 1 : 0.3, transition: '0.5s' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <h4>Nearby Job Leads</h4>
                  <p style={{ color: Theme.colors.muted }}>{onDuty ? "3 Clients looking for " + selectedCategory : "Go On Duty to see leads"}</p>
               </div>
               
               {onDuty && (
                 <div style={{ position: 'absolute', top: '30%', left: '40%', cursor: 'pointer' }} onClick={() => setCalling("Client #204")}>
                    <div className="animate-float" style={{ padding: '0.5rem', background: Theme.colors.primary, borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
                      New Request!
                    </div>
                    <div style={{ width: '12px', height: '12px', background: Theme.colors.primary, borderRadius: '50%', margin: '4px auto' }}></div>
                 </div>
               )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
