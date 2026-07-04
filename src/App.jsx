import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const [session, setSession] = React.useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <div style={{ color: '#fff', padding: '2rem' }}>Ładowanie...</div>;
  return session ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
