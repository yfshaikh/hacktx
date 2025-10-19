import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Avatar from './pages/Avatar/Avatar';
import AgentDemo from './pages/AgentDemo/AgentDemo';
import { CardManagerProvider } from './lib/cardManager';
import { CardRenderer } from './components/CardRenderer';

function App() {
  return (
    <CardManagerProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/avatar" replace />} />
            <Route path="/avatar" element={<Avatar />} />
            <Route path="/agent-demo" element={<AgentDemo />} />
          </Route>
        </Routes>
      </Router>
      {/* CardRenderer manages all dynamic agent result cards */}
      <CardRenderer />
    </CardManagerProvider>
  );
}

export default App;
