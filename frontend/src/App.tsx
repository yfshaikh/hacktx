import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Avatar from './pages/Avatar/Avatar';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/avatar" replace />} />
          <Route path="/avatar" element={<Avatar />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
