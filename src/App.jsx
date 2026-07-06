import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import Login from './pages/Login';
import Legal from './pages/Legal';
import Docs from './pages/Docs';
import Settings from './pages/Settings';

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
        <Route path="/ustawienia" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/regulamin" element={<Legal />} />
        <Route path="/polityka-prywatnosci" element={<Legal />} />
        <Route path="/warunki" element={<Legal />} />
        <Route path="/dokumentacja" element={<Docs />} />
      </Routes>
    </Router>
  );
}

export default App;
