import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pomodoro  from './pages/Pomodoro';
import GamesZone from './pages/GamesZone';
import Chatbot   from './pages/Chatbot';
import Navbar    from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return !token ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9' } }} />
      <Routes>
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><Navbar /></PrivateRoute>}>
          <Route index          element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pomodoro"  element={<Pomodoro />} />
          <Route path="games"     element={<GamesZone />} />
          <Route path="chatbot"   element={<Chatbot />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
