import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useGitHubAuth } from './hooks/useGitHubAuth';
import { AuthPage } from './pages/AuthPage';
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
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto py-6 px-4">
                    <h1 className="text-3xl font-bold text-gray-900">EpiGrader</h1>
                    <p className="mt-2 text-gray-600">Évaluation automatique des projets Epitech</p>
                  </div>
                </header>
                <main className="max-w-7xl mx-auto py-6 px-4">
                  <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-700">Dashboard en construction...</p>
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/auth" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;