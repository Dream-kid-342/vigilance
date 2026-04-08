import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientApp from './client/ClientApp';
import WorkerApp from './worker/WorkerApp';
import AdminApp from './admin/AdminApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<ClientApp genericAuth={true} />} />
        <Route path="/client/*" element={<ClientApp />} />
        <Route path="/worker/*" element={<WorkerApp />} />
        <Route path="/admin/*"  element={<AdminApp />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

