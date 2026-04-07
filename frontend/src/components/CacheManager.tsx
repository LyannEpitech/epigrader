import { useState, useEffect, useCallback } from 'react';
import { analysisApi, CacheEntry } from '../services/analysis';
import { useNotification } from '../contexts/NotificationContext';
import { Database, Trash2, Clock, ExternalLink, RefreshCw } from 'lucide-react';

export const CacheManager = () => {
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useNotification();

  const loadCache = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await analysisApi.getCacheEntries();
      setEntries(data.entries || []);
    } catch (err) {
      showError('Failed to load cache entries');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCache();
  }, [loadCache]);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cached repositories?')) return;
    
    try {
      await analysisApi.clearCache();
      success('Cache cleared successfully');
      loadCache();
    } catch (err) {
      showError('Failed to clear cache');
    }
  };

  const handleClearEntry = async (repoUrl: string) => {
    try {
      await analysisApi.clearCacheEntry(repoUrl);
      success('Cache entry removed');
      loadCache();
    } catch (err) {
      showError('Failed to remove cache entry');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Cached Repositories</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {entries.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadCache}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {entries.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No cached repositories</p>
          <p className="text-sm mt-1">Analyzed repositories will appear here</p>
        </div>
      ) : (
        <div className="divide-y max-h-96 overflow-y-auto">
          {entries.map((entry, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={entry.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate flex items-center gap-1"
                    >
                      {entry.repoUrl.replace('https://github.com/', '')}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span title={formatDate(entry.timestamp)}>
                      Cached {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleClearEntry(entry.repoUrl)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from cache"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};