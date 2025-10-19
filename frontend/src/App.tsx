import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SimpleLayout from './components/SimpleLayout';
import Avatar from './pages/Avatar/Avatar';
import Settings from './pages/Settings/Settings';
import { CardManagerProvider } from './lib/cardManager';
import { CardRenderer } from './components/CardRenderer';
import AuthPage from './pages/auth/AuthPage';
import LandingPage from './pages/landing/LandingPage';
import { AuthProvider } from './context/auth-context';

function App() {
  return (
    <AuthProvider>
      <CardManagerProvider>
        <Router>
          <Routes>
            {/* Routes without sidebar */}
            <Route element={<SimpleLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
            </Route>
            
            {/* Routes with sidebar */}
            <Route element={<Layout />}>
              <Route path="/avatar" element={<Avatar />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        {/* CardRenderer manages all dynamic agent result cards */}
        <CardRenderer />
      </CardManagerProvider>
    </AuthProvider>
  );
}

export default App;
