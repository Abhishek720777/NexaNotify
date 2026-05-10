import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">NotifyEngine</div>
        <nav>
          <a href="/" className={window.location.pathname === '/' ? 'active' : ''}>Dashboard</a>
          <a href="/templates" className={window.location.pathname === '/templates' ? 'active' : ''}>Templates</a>
          <a href="/logs" className={window.location.pathname === '/logs' ? 'active' : ''}>Logs</a>
          <a href="/analytics" className={window.location.pathname === '/analytics' ? 'active' : ''}>Analytics</a>
        </nav>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>Logout</button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/templates" element={
          <PrivateRoute>
            <Layout><Templates /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/logs" element={
          <PrivateRoute>
            <Layout><Logs /></Layout>
          </PrivateRoute>
        } />
        
        <Route path="/analytics" element={
          <PrivateRoute>
            <Layout><Analytics /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
