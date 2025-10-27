import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <div className="spinner mb-20"></div>
        <p className="text-orange text-xl font-spooky glow-text">
          🎃 Loading Spooky Data... 👻
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;