import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGitHubAuth } from './hooks/useGitHubAuth';
import { AuthPage } from './pages/AuthPage';
import { RubricPage } from './pages/RubricPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

function App() {
  const { isAuthenticated } = useGitHubAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/rubric" 
          element={isAuthenticated ? <RubricPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/analyze" 
          element={isAuthenticated ? <AnalyzePage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/history" 
          element={isAuthenticated ? <HistoryPage /> : <Navigate to="/auth" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;