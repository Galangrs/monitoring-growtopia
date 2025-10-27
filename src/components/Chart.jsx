import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { Maximize2, Minimize2 } from 'lucide-react';

const Chart = ({ data, title, dataKey, color = '#ff6b35' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="spooky-card p-15">
          <p className="text-orange font-semibold mb-10">{data.timestamp}</p>
          <p className="text-white mb-10">
            <span className="text-gray">Players: </span>
            <span className="font-mono">{data.playerCount?.toLocaleString()}</span>
          </p>
          <p className="text-white mb-10">
            <span className="text-gray">Ban Rate: </span>
            <span className="font-mono">{(data.banRate * 100).toFixed(1)}%</span>
          </p>
          <p className="text-white">
            <span className="text-gray">Banned: </span>
            <span className="font-mono">{data.bannedPlayer}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const chartClass = isFullscreen ? 'chart-container chart-fullscreen' : 'chart-container';
  const chartHeight = isFullscreen ? 'calc(100vh - 120px)' : '400px';

  return (
    <div className={chartClass}>
      <div className="flex-between mb-20">
        <h3 className="text-xl font-bold text-orange glow-text">
          {title}
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-10"
          style={{
            background: 'rgba(255, 107, 53, 0.2)',
            border: '1px solid rgba(255, 107, 53, 0.5)',
            borderRadius: '8px',
            color: '#ff6b35',
            cursor: 'pointer'
          }}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => data[value]?.timestamp?.split(' ')[2]?.substring(0, 5) || ''}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={false} // Force no dots
              activeDot={{ 
                r: 6, 
                stroke: color, 
                strokeWidth: 2, 
                fill: '#1a1a1a',
                style: { filter: 'drop-shadow(0px 0px 6px rgba(255, 107, 53, 0.8))' }
              }}
            />
            <Brush
              dataKey="time"
              height={30}
              stroke={color}
              fill="#1a1a1a"
              tickFormatter={(value) => data[value]?.timestamp?.split(' ')[2]?.substring(0, 5) || ''}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;