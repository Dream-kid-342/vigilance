import React, { useState } from 'react';
import { Theme, Card, Button } from './UI';

const RoleSignup = ({ onSelect }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: Theme.colors.darker }}>
      <Card style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to Vigilance</h2>
        <p style={{ color: Theme.colors.muted, marginBottom: '2rem' }}>Choose your path to get started</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button onClick={() => onSelect('client')} style={{ height: '80px', fontSize: '1.1rem' }}>
            Join as Client
            <p style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>I need to book services</p>
          </Button>
          
          <Button variant="outline" onClick={() => onSelect('worker')} style={{ height: '80px', fontSize: '1.1rem', border: `1px solid ${Theme.colors.primary}` }}>
            Join as Worker
            <p style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>I want to offer services</p>
          </Button>
        </div>
        
        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: Theme.colors.muted }}>
          By signing up, you agree to our terms of service (Kenya ODPC compliant).
        </p>
      </Card>
    </div>
  );
};

export default RoleSignup;
