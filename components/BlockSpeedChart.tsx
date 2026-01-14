
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BlockData } from '../types';

interface BlockSpeedChartProps {
  history: BlockData[];
}

const BlockSpeedChart: React.FC<BlockSpeedChartProps> = ({ history }) => {
  // Calculate block times (diff between consecutive timestamps)
  const chartData = history.slice(1).map((block, index) => {
    const prevBlock = history[index];
    const blockTime = block.timestamp - prevBlock.timestamp;
    return {
      name: `#${block.number.toString().slice(-4)}`,
      time: blockTime,
    };
  });

  return (
    <div className="h-64 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 10]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#f59e0b' }}
          />
          <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '3s Target', fill: '#ef4444', fontSize: 10 }} />
          <Line 
            type="monotone" 
            dataKey="time" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#f59e0b' }} 
            activeDot={{ r: 6 }} 
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BlockSpeedChart;
