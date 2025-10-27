import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGameData } from '../hooks/useGameData';
import Chart from './Chart';
import LoadingSpinner from './LoadingSpinner';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Skull,
  RefreshCw,
  BarChart3,
  History,
  Server,
  ShoppingBag,
  ExternalLink,
  Settings,
  X,
} from 'lucide-react';

const Dashboard = () => {
  const { currentData, historyData, sponsorData, loading, error, refetch } = useGameData();
  const [activeView, setActiveView] = useState('chart');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    showSponsors: true,
    showPlayerChart: true,
    showHistoryLog: true,
    autoRefresh: true,
    refreshInterval: 60000, // 60 seconds
  });

  // Ref untuk auto scroll
  const firstResultRef = useRef(null);
  const historyLogRef = useRef(null);

  // Auto-refresh effect
  useEffect(() => {
    if (!settings.autoRefresh) return;

    const intervalId = setInterval(() => {
      refetch();
    }, settings.refreshInterval);

    return () => clearInterval(intervalId);
  }, [settings.autoRefresh, settings.refreshInterval, refetch]);

  // Filter history data berdasarkan search term
  const filteredHistoryData = useMemo(() => {
    if (!searchTerm) return historyData;
    
    return historyData.filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      return (
        entry.timestamp.toLowerCase().includes(searchLower) ||
        entry.playerCount.toString().includes(searchLower) ||
        entry.banRate.toString().includes(searchLower) ||
        entry.bannedPlayer.toString().includes(searchLower) ||
        entry.nukedWorld.toString().includes(searchLower)
      );
    });
  }, [historyData, searchTerm]);

  // Function to highlight search term
  const highlightText = (text, term) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="highlight">{part}</span> : 
        part
    );
  };

  // Generate avatar from username
  const generateAvatar = (username) => {
    return username.charAt(0).toUpperCase();
  };

  // Toggle setting
  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Update refresh interval
  const updateRefreshInterval = (value) => {
    setSettings(prev => ({
      ...prev,
      refreshInterval: parseInt(value)
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="text-center spooky-card p-30">
          <Skull size={64} className="text-red mb-20" style={{ margin: '0 auto' }} />
          <p className="text-red text-xl mb-20">Error: {error}</p>
          <button onClick={refetch} className="spooky-button">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const SponsorTile = ({ sponsor, rank }) => {
    const getIntensity = (amount) => {
      const numAmount = parseFloat(sponsor.Total.replace(/[^0-9.]/g, ''));
      if (numAmount >= 1000) return 'intensity-4';
      if (numAmount >= 500) return 'intensity-3';
      if (numAmount >= 100) return 'intensity-2';
      return 'intensity-1';
    };

    const formatAmount = (amount) => {
      const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
      if (num >= 1000) return `$${(num/1000).toFixed(1)}k`;
      return `$${num}`;
    };

    return (
      <div 
        className={`sponsor-tile ${getIntensity()} ${rank <= 3 ? 'top-rank' : ''}`}
        title={`${sponsor.Discord} - ${sponsor.Total}\n${sponsor.Description}`}
      >
        <div className="sponsor-tile-content">
          <div className="sponsor-tile-avatar">
            {generateAvatar(sponsor.Discord)}
          </div>
          <div className="sponsor-tile-info">
            <div className="sponsor-tile-name">{sponsor.Discord}</div>
            <div className="sponsor-tile-amount">{formatAmount(sponsor.Total)}</div>
          </div>
          {rank <= 3 && (
            <div className="sponsor-tile-rank">
              {rank === 1 ? '👑' : rank === 2 ? '🥈' : '🥉'}
            </div>
          )}
        </div>
        
        {/* Hover Tooltip */}
        <div className="sponsor-tooltip">
          <div className="tooltip-header">
            <strong>{sponsor.Discord}</strong>
            <span className="tooltip-amount">{sponsor.Total}</span>
          </div>
          <div className="tooltip-desc">{sponsor.Description}</div>
          <a href={sponsor.Store} target="_blank" rel="noopener noreferrer" className="tooltip-link">
            <ExternalLink size={12} />
            Visit Store
          </a>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'text-orange' }) => (
    <div className="stat-card">
      <div className="flex-between">
        <div>
          <p className="text-gray text-small font-medium mb-10">{title}</p>
          <p className={`text-2xl font-bold ${color} glow-text`}>{value}</p>
          {subtitle && <p className="text-gray text-small mt-10">{subtitle}</p>}
        </div>
        <Icon size={32} className={color} />
      </div>
    </div>
  );

  const ModCard = ({ mod }) => (
    <div className="spooky-card">
      <div className="flex-between">
        <div className="flex gap-15" style={{ alignItems: 'center' }}>
          <div className={`status-dot ${mod.idle ? 'status-yellow' : 'status-green'}`}></div>
          <span className="text-white font-medium">{mod.name}</span>
        </div>
        <div className="flex gap-10">
          {mod.undercover && (
            <span className="badge badge-purple">Undercover</span>
          )}
          <span className={`badge ${mod.idle ? 'badge-yellow' : 'badge-green'}`}>
            {mod.idle ? 'Idle' : 'Active'}
          </span>
        </div>
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
      <div className="modal-content spooky-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex-between mb-20">
          <h2 className="text-xl font-bold text-orange flex gap-10" style={{ alignItems: 'center' }}>
            <Settings size={24} />
            Dashboard Settings
          </h2>
          <button 
            onClick={() => setShowSettings(false)} 
            className="icon-button"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-group">
          <h3 className="text-white font-medium mb-15">Display Options</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.showSponsors}
                onChange={() => toggleSetting('showSponsors')}
                className="setting-checkbox"
              />
              <span>Show Sponsors Section</span>
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.showPlayerChart}
                onChange={() => toggleSetting('showPlayerChart')}
                className="setting-checkbox"
              />
              <span>Show Player Chart</span>
            </label>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.showHistoryLog}
                onChange={() => toggleSetting('showHistoryLog')}
                className="setting-checkbox"
              />
              <span>Show History Log</span>
            </label>
          </div>
        </div>

        <div className="settings-group mt-20">
          <h3 className="text-white font-medium mb-15">Auto-Refresh</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={() => toggleSetting('autoRefresh')}
                className="setting-checkbox"
              />
              <span>Enable Auto-Refresh</span>
            </label>
          </div>

          {settings.autoRefresh && (
            <div className="setting-item">
              <label className="setting-label-block">
                <span className="text-gray text-small">Refresh Interval</span>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => updateRefreshInterval(e.target.value)}
                  className="setting-select"
                >
                  <option value="30000">30 seconds</option>
                  <option value="60000">1 minute</option>
                  <option value="120000">2 minutes</option>
                  <option value="300000">5 minutes</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="mt-30 text-center">
          <button onClick={() => setShowSettings(false)} className="spooky-button">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="container">
      {/* Settings Modal */}
      {showSettings && <SettingsModal />}

      {/* Header */}
      <div className="text-center mb-30">
        <h1 className="text-3xl font-spooky text-orange glow-text mb-10">
          🎃 Spooky Game Dashboard 👻
        </h1>
        <p className="text-gray mb-20">
          Last updated: {new Date(currentData?.last_updated).toLocaleString()}
        </p>
        <div className="flex gap-10 justify-center">
          <button onClick={refetch} className="spooky-button">
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <button onClick={() => setShowSettings(true)} className="spooky-button">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-30">
        <StatCard
          icon={Users}
          title="Total Players"
          value={currentData?.count_player?.toLocaleString()}
          subtitle="Online now"
        />
        <StatCard
          icon={AlertTriangle}
          title="Ban Rate"
          value={`${(currentData?.ban_rate * 100)?.toFixed(1)}%`}
          subtitle="Current rate"
          color="text-red"
        />
        <StatCard
          icon={Shield}
          title="Banned Players"
          value={currentData?.ban_player}
          subtitle="Total banned global chat"
          color="text-red"
        />
        <StatCard
          icon={Skull}
          title="Nuked Worlds"
          value={currentData?.nuke_world}
          subtitle="Total nuke global chat"
          color="text-purple"
        />
        <StatCard
          icon={Server}
          title="Server Status"
          value={(() => {
            if (!currentData?.last_updated) return 'No Data';
            if (currentData.server_maintance) return 'Under Maintenance';
            
            const lastUpdated = new Date(currentData.last_updated);
            const now = new Date();
            const diffInMinutes = (now - lastUpdated) / (1000 * 60);
            
            return diffInMinutes > 10 ? 'Offline' : 'Online';
          })()}
          subtitle={(() => {
            if (!currentData?.last_updated) return 'No connection';
            if (currentData.server_maintance) return 'Scheduled maintenance';
            
            const lastUpdated = new Date(currentData.last_updated);
            const now = new Date();
            const diffInMinutes = (now - lastUpdated) / (1000 * 60);
            
            return diffInMinutes > 10 ? 'Connection lost' : 'System operational';
          })()}
          color={(() => {
            if (!currentData?.last_updated) return 'text-red';
            if (currentData.server_maintance) return 'text-yellow';
            
            const lastUpdated = new Date(currentData.last_updated);
            const now = new Date();
            const diffInMinutes = (now - lastUpdated) / (1000 * 60);
            
            return diffInMinutes > 10 ? 'text-red' : 'text-green';
          })()}
        />
      </div>

      {/* Moderators */}
      <div className="mb-30">
        <h2 className="text-xl font-bold text-orange mb-20 flex gap-10" style={{ alignItems: 'center' }}>
          <Shield size={24} />
          Moderators Status
        </h2>
        <div className="grid grid-3">
          {currentData?.mods?.map((mod, index) => (
            <ModCard key={index} mod={mod} />
          ))}
        </div>
      </div>

      {/* View Toggle - Only show if at least one view is enabled */}
      {(settings.showPlayerChart || settings.showHistoryLog) && (
        <>
          <div className="toggle-buttons">
            {settings.showPlayerChart && (
              <button
                onClick={() => setActiveView('chart')}
                className={`toggle-button flex gap-10 ${activeView === 'chart' ? 'active' : ''}`}
              >
                <BarChart3 size={16} />
                Player Chart
              </button>
            )}
            {settings.showHistoryLog && (
              <button
                onClick={() => setActiveView('history')}
                className={`toggle-button flex gap-10 ${activeView === 'history' ? 'active' : ''}`}
              >
                <History size={16} />
                History Log
              </button>
            )}
          </div>

          {/* Chart/History Content */}
          {activeView === 'chart' && settings.showPlayerChart && (
            <Chart
              data={historyData}
              title="Player Count Over Time"
              dataKey="playerCount"
              color="#ff6b35"
            />
          )}

          {activeView === 'history' && settings.showHistoryLog && (
            <div className="spooky-card">
              <h3 className="text-xl font-bold text-orange mb-20 flex gap-10" style={{ alignItems: 'center' }}>
                <History size={20} />
                Player History Log
              </h3>
              {/* History Log */}
              <div className="history-log" ref={historyLogRef}>
                {filteredHistoryData.length > 0 ? (
                  filteredHistoryData.map((entry, index) => (
                    <div 
                      key={index} 
                      className="history-item"
                      ref={index === 0 && searchTerm ? firstResultRef : null}
                    >
                      <span className="text-orange">
                        [{highlightText(entry.timestamp, searchTerm)}]
                      </span>
                      <span style={{ marginLeft: '8px' }}>
                        Players: {highlightText(entry.playerCount.toLocaleString(), searchTerm)}
                      </span>
                      <span style={{ marginLeft: '16px' }}>
                        Ban Rate: {highlightText((entry.banRate * 100).toFixed(1) + '%', searchTerm)}
                      </span>
                      <span style={{ marginLeft: '16px' }}>
                        Banned: {highlightText(entry.bannedPlayer.toString(), searchTerm)}
                      </span>
                      <span style={{ marginLeft: '16px' }}>
                        Nuked: {highlightText(entry.nukedWorld.toString(), searchTerm)}
                      </span>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="text-center p-30">
                    <p className="text-gray">No entries found matching "{searchTerm}"</p>
                    <button onClick={clearSearch} className="spooky-button mt-20">
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-30">
                    <p className="text-gray">No history data available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sponsor Grid */}
      {settings.showSponsors && (
        <div className="mb-30">
          <h2 className="text-xl font-bold text-orange mb-20 flex gap-10" style={{ alignItems: 'center' }}>
            <ShoppingBag size={24} />
            Sponsor
          </h2>
          <div className="sponsor-contribution-grid">
            {sponsorData.map((sponsor, index) => (
              <SponsorTile key={index} sponsor={sponsor} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;