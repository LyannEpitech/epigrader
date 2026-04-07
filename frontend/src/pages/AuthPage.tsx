import { useState } from 'react';
import { useGitHubAuth } from '../hooks/useGitHubAuth';
import { useNotification } from '../contexts/NotificationContext';
import { Github, Lock, Eye, EyeOff, Sparkles, Code2, BookOpen, CheckCircle } from 'lucide-react';

export const AuthPage = () => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useGitHubAuth();
  const { success, error: showError } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      showError('Please enter your GitHub PAT');
      return;
    }

    setIsLoading(true);
    const result = await login(token);
    setIsLoading(false);

    if (result) {
      success('Successfully authenticated with GitHub!');
    } else {
      showError('Invalid GitHub PAT. Please check your token and try again.');
    }
  };

  const features = [
    { icon: Code2, text: 'Automatic code analysis' },
    { icon: BookOpen, text: 'Rubric-based grading' },
    { icon: CheckCircle, text: 'Detailed feedback' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
              <Sparkles className="w-10 h-10 text-[#ff6b35]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">EpiGrader</h1>
              <p className="text-white/70">AI-Powered Code Review</p>
            </div>
          </div>
          
          <p className="text-lg text-white/80 leading-relaxed">
            Evaluate Epitech student projects automatically using AI. 
            Get detailed grading reports with actionable feedback.
          </p>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg">
                  <feature.icon className="w-5 h-5 text-[#ff6b35]" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl mb-4">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Enter your GitHub PAT to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Personal Access Token
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Your token is stored locally and never shared. 
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#1e3a5f] hover:underline ml-1"
                >
                  Create a token
                </a>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white font-medium rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In with GitHub'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};