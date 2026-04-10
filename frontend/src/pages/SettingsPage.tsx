import { useState, useEffect } from 'react';
import { Key, Github, Save, Eye, EyeOff, Check, AlertCircle, Trash2 } from 'lucide-react';
import { authStorage } from '../services/auth.storage';

interface Settings {
  moonshotApiKey: string;
  githubToken: string;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    moonshotApiKey: '',
    githubToken: '',
  });
  const [showKeys, setShowKeys] = useState({
    moonshot: false,
    github: false,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const moonshotKey = authStorage.getMoonshotKey();
      const githubToken = authStorage.getGitHubToken();
      
      setSettings({
        moonshotApiKey: moonshotKey || '',
        githubToken: githubToken || '',
      });
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    setMessage('');

    try {
      // Validate keys before saving
      const validations: string[] = [];

      if (settings.moonshotApiKey) {
        // Basic format check for Moonshot key
        if (!settings.moonshotApiKey.startsWith('sk-')) {
          validations.push('La clé Moonshot doit commencer par "sk-"');
        }
      }

      if (settings.githubToken) {
        // Basic format check for GitHub token
        if (settings.githubToken.length < 20) {
          validations.push('Le token GitHub semble trop court');
        }
      }

      if (validations.length > 0) {
        setStatus('error');
        setMessage(validations.join(', '));
        return;
      }

      // Save to storage
      if (settings.moonshotApiKey) {
        authStorage.setMoonshotKey(settings.moonshotApiKey);
      }
      if (settings.githubToken) {
        authStorage.setGitHubToken(settings.githubToken);
      }

      setStatus('saved');
      setMessage('Configuration sauvegardée avec succès !');

      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Erreur lors de la sauvegarde');
    }
  };

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les tokens ?')) {
      authStorage.clearAll();
      setSettings({
        moonshotApiKey: '',
        githubToken: '',
      });
      setStatus('saved');
      setMessage('Tous les tokens ont été supprimés');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-2 text-gray-600">
            Configurez vos clés API pour utiliser EpiGrader
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              status === 'saved'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : status === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {status === 'saved' ? (
              <Check className="w-5 h-5" />
            ) : status === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : null}
            <span>{message}</span>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Moonshot API Key */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Clé API Moonshot</h3>
                <p className="text-sm text-gray-500">
                  Requise pour l'analyse par IA
                </p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showKeys.moonshot ? 'text' : 'password'}
                value={settings.moonshotApiKey}
                onChange={(e) =>
                  setSettings({ ...settings, moonshotApiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() =>
                  setShowKeys({ ...showKeys, moonshot: !showKeys.moonshot })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.moonshot ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {settings.moonshotApiKey && !showKeys.moonshot && (
              <p className="mt-2 text-sm text-gray-500">
                Clé actuelle : {maskKey(settings.moonshotApiKey)}
              </p>
            )}

            <div className="mt-3 text-sm text-gray-500">
              <a
                href="https://platform.moonshot.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline"
              >
                Obtenir une clé Moonshot
              </a>
            </div>
          </div>

          {/* GitHub Token */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Github className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Token GitHub</h3>
                <p className="text-sm text-gray-500">
                  Requis pour accéder aux repositories
                </p>
              </div>
            </div>

            <div className="relative">
              <input
                type={showKeys.github ? 'text' : 'password'}
                value={settings.githubToken}
                onChange={(e) =>
                  setSettings({ ...settings, githubToken: e.target.value })
                }
                placeholder="ghp_..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() =>
                  setShowKeys({ ...showKeys, github: !showKeys.github })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys.github ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {settings.githubToken && !showKeys.github && (
              <p className="mt-2 text-sm text-gray-500">
                Token actuel : {maskKey(settings.githubToken)}
              </p>
            )}

            <div className="mt-3 text-sm text-gray-500">
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 underline"
              >
                Créer un token GitHub
              </a>{' '}
              (scope : repo)
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Effacer tout</span>
            </button>

            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Sécurité</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Les tokens sont stockés localement dans votre navigateur</li>
            <li>• Ils ne sont jamais envoyés à nos serveurs</li>
            <li>• Utilisez des tokens avec les permissions minimales nécessaires</li>
          </ul>
        </div>
      </div>
    </div>
  );
}