import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ClientApp from './apps/client/ClientApp';
import WorkerApp from './apps/worker/WorkerApp';
import AdminApp from './apps/admin/AdminApp';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/client" element={<ClientApp />} />
          <Route path="/worker" element={<WorkerApp />} />
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
