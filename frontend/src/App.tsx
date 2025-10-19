import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Avatar from './pages/Avatar/Avatar';
import { CardManagerProvider } from './lib/cardManager';
import { CardRenderer } from './components/CardRenderer';
import AuthPage from './pages/auth/AuthPage';

function App() {
  return (
    <CardManagerProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<AuthPage />} />
            <Route path="/avatar" element={<Avatar />} />
          </Route>
        </Routes>
      </Router>
      {/* CardRenderer manages all dynamic agent result cards */}
      <CardRenderer />
    </CardManagerProvider>
  );
}

export default App;
