import { useState, useEffect, useCallback } from 'react';
import { parseHistoryData } from '../utils/parseHistory';

// Local Storage utilities
const getStorageItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

// Scroll position utilities
const saveScrollPosition = () => {
  setStorageItem('scrollPosition', window.scrollY);
};

const restoreScrollPosition = () => {
  const savedPosition = getStorageItem('scrollPosition', 0);
  if (savedPosition > 0) {
    setTimeout(() => {
      window.scrollTo({ top: savedPosition, behavior: 'smooth' });
    }, 100);
  }
};

export const useGameData = () => {
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [sponsorData, setSponsorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settings from localStorage
  const [settings, setSettings] = useState(() => 
    getStorageItem('dashboardSettings', {
      showSponsors: true,
      autoRefresh: true,
      refreshInterval: 60000
    })
  );

  // Update settings and save to localStorage
  const updateSettings = useCallback((newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    setStorageItem('dashboardSettings', updatedSettings);
    
    // Apply performance mode
    if (newSettings.performanceMode !== undefined) {
      document.body.classList.toggle('performance-mode', newSettings.performanceMode);
    }
  }, [settings]);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      // Save scroll position before refresh
      if (isRefresh) {
        saveScrollPosition();
      }
      
      setLoading(true);
      setError(null);
      
      console.log('Fetching data...');
      
      // Always fetch main data
      const promises = [
        fetch('https://gist.githubusercontent.com/Galangrs/22b5c1862e275a14dbbd9adef3103250/raw/config.json'),
        fetch('https://gist.githubusercontent.com/Galangrs/22b5c1862e275a14dbbd9adef3103250/raw/historyPlayer.json')
      ];

      // Only fetch sponsor data if enabled
      if (settings.showSponsors) {
        promises.push(fetch('/sponsor.json'));
      }

      const responses = await Promise.all(promises);

      if (!responses[0].ok || !responses[1].ok) {
        throw new Error('Failed to fetch main data');
      }

      const config = await responses[0].json();
      const history = await responses[1].json();

      // Handle sponsor data if enabled
      let sponsors = [];
      if (settings.showSponsors && responses[2]) {
        try {
          if (responses[2].ok) {
            sponsors = await responses[2].json();
          }
        } catch (sponsorError) {
          console.warn('Failed to fetch sponsor data:', sponsorError);
        }
      }

      console.log('Data fetched:', { config, history, sponsors, settings });

      setCurrentData(config);
      setHistoryData(parseHistoryData(history.historyPlayer));
      setSponsorData(sponsors);

      // Restore scroll position after refresh
      if (isRefresh) {
        restoreScrollPosition();
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [settings.showSponsors]);

  // Manual refresh function
  const refetch = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    
    // Auto refresh only if enabled
    if (settings.autoRefresh) {
      const interval = setInterval(() => fetchData(true), settings.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, settings.autoRefresh, settings.refreshInterval]);

  // Apply performance mode on load
  useEffect(() => {
    document.body.classList.toggle('performance-mode', settings.performanceMode);
  }, [settings.performanceMode]);

  return { 
    currentData, 
    historyData, 
    sponsorData, 
    loading, 
    error, 
    settings,
    updateSettings,
    refetch 
  };
};