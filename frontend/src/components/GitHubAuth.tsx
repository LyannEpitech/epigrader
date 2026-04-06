import { useState } from 'react';
import { useGitHubAuth } from '../hooks/useGitHubAuth';
import { Eye, EyeOff, Github, Loader2 } from 'lucide-react';

export const GitHubAuth = () => {
  const [pat, setPat] = useState('');
  const [showPat, setShowPat] = useState(false);
  const { login, logout, isAuthenticated, user, isLoading, error } = useGitHubAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pat.trim()) return;
    await login(pat);
  };

  if (isAuthenticated && user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {user.name || user.login}
            </h3>
            <p className="text-sm text-gray-500">@{user.login}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Github className="w-6 h-6" />
        <h2 className="text-xl font-semibold text-gray-900">
          Connexion GitHub
        </h2>
      </div>

      <p className="text-gray-600 mb-4">
        Entrez votre Personal Access Token (PAT) GitHub pour accéder aux repositories.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pat" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showPat ? 'text' : 'password'}
              id="pat"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPat(!showPat)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPat ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Le token est stocké localement dans votre navigateur.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !pat.trim()}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </div>
  );
};