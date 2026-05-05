import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AppDetail from './pages/AppDetail.jsx';
import Analyzer from './pages/Analyzer.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/applications/:id" element={<AppDetail />} />
        <Route path="/analyzer" element={<Analyzer />} />
      </Route>
    </Routes>
  );
}
