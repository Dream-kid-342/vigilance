import React from 'react';
import { useNavigate } from 'react-router-dom';
// Re-use the same LandingPage component from client/src — single source of truth.
// We pass navigation callbacks that use React Router instead of local state.
import LandingPageComponent from '../client/components/LandingPage.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <LandingPageComponent
      onSignIn={() => navigate('/login')}
      onEnterClient={() => navigate('/client')}
      onEnterWorker={() => navigate('/worker')}
    />
  );
}



