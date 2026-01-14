
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLatestBlock } from './services/bscService';
import { getAIInsight } from './services/geminiService';
import { NetworkStats, BlockData, CalculationResult } from './types';
import StatCard from './components/StatCard';
import BlockSpeedChart from './components/BlockSpeedChart';

const App: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    currentBlock: 0,
    avgBlockTime: 3.0,
    history: [],
    lastUpdate: Date.now(),
  });
  const [loading, setLoading] = useState(true);
  const [targetBlockInput, setTargetBlockInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('Initializing AI analysis...');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const historyRef = useRef<BlockData[]>([]);

  const updateNetworkData = useCallback(async () => {
    try {
      const latest = await fetchLatestBlock();
      
      // Update history if it's a new block
      if (historyRef.current.length === 0 || historyRef.current[historyRef.current.length - 1].number < latest.number) {
        const newHistory = [...historyRef.current, latest].slice(-12); // Keep last 12
        historyRef.current = newHistory;

        // Calculate Average
        let avg = 3.0;
        if (newHistory.length > 1) {
          const totalTime = newHistory[newHistory.length - 1].timestamp - newHistory[0].timestamp;
          avg = totalTime / (newHistory.length - 1);
        }

        setStats({
          currentBlock: latest.number,
          avgBlockTime: avg,
          history: newHistory,
          lastUpdate: Date.now(),
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to update BSC data", err);
    }
  }, []);

  // Poll every 3 seconds for BSC
  useEffect(() => {
    updateNetworkData();
    const interval = setInterval(updateNetworkData, 3000);
    return () => clearInterval(interval);
  }, [updateNetworkData]);

  // Perform Calculation when inputs change
  useEffect(() => {
    const target = parseInt(targetBlockInput);
    if (!isNaN(target) && target > stats.currentBlock) {
      const blocksRemaining = target - stats.currentBlock;
      const estimatedSeconds = blocksRemaining * stats.avgBlockTime;
      const estimatedDate = new Date(Date.now() + estimatedSeconds * 1000);

      setCalcResult({
        targetBlock: target,
        blocksRemaining,
        estimatedSeconds,
        estimatedDate,
      });
    } else {
      setCalcResult(null);
    }
  }, [targetBlockInput, stats]);

  const handleAiRefresh = async () => {
    if (!calcResult) return;
    setIsAiLoading(true);
    const insight = await getAIInsight(
      stats.currentBlock,
      stats.avgBlockTime,
      calcResult.targetBlock,
      calcResult.blocksRemaining
    );
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    
    return parts.join(' ');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center">
            <span className="text-amber-500 mr-3">
              <i className="fa-solid fa-cube animate-pulse-gold"></i>
            </span>
            BSC SENTINEL
          </h1>
          <p className="text-slate-400 mt-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Real-time Binance Smart Chain Mainnet monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-4 py-2 glass rounded-full text-xs font-mono text-amber-500 flex items-center">
            <i className="fa-solid fa-clock-rotate-left mr-2"></i>
            POLLING RATE: 3000ms
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 glass rounded-3xl">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Connecting to BSC Network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Dashboard Stats */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard 
                label="Current Block Height" 
                value={stats.currentBlock.toLocaleString()} 
                subValue={`Last updated ${Math.floor((Date.now() - stats.lastUpdate)/1000)}s ago`}
                icon="fa-layer-group" 
                colorClass="bg-amber-500"
              />
              <StatCard 
                label="Avg Block Speed" 
                value={`${stats.avgBlockTime.toFixed(2)}s`} 
                subValue="Target: ~3.00 seconds"
                icon="fa-bolt-lightning" 
                colorClass="bg-blue-500"
              />
            </div>

            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold flex items-center">
                  <i className="fa-solid fa-chart-line text-amber-500 mr-2"></i>
                  Block Production Consistency
                </h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">Variation in time between individual blocks (last 10 blocks)</p>
              <BlockSpeedChart history={stats.history} />
            </div>

            {/* AI Insights Section */}
            <div className="glass p-6 rounded-3xl border-l-4 border-purple-500 bg-gradient-to-r from-slate-800/50 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center text-purple-300">
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                  Gemini AI Network Insights
                </h3>
                {calcResult && (
                   <button 
                    onClick={handleAiRefresh}
                    disabled={isAiLoading}
                    className="text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3 py-1 rounded-lg transition-colors flex items-center"
                  >
                    {isAiLoading ? <i className="fa-solid fa-spinner animate-spin mr-2"></i> : <i className="fa-solid fa-arrows-rotate mr-2"></i>}
                    Analyze Context
                  </button>
                )}
              </div>
              <div className="text-slate-300 leading-relaxed italic">
                {aiInsight ? `"${aiInsight}"` : "Input a target block to get AI prediction insights."}
              </div>
            </div>
          </div>

          {/* Calculator Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-3xl h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <i className="fa-solid fa-calculator text-amber-500 mr-3"></i>
                Block Arrival Estimator
              </h3>
              
              <div className="space-y-4">
                <label className="block text-slate-400 text-sm font-medium">TARGET BLOCK ID</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={targetBlockInput}
                    onChange={(e) => setTargetBlockInput(e.target.value)}
                    placeholder="e.g. 45000000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-amber-500"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <i className="fa-solid fa-hashtag"></i>
                  </div>
                </div>
              </div>

              {calcResult ? (
                <div className="mt-8 space-y-6 flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold">Blocks to go</p>
                    <p className="text-3xl font-mono font-bold text-white">{calcResult.blocksRemaining.toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 glow-yellow">
                    <p className="text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Estimated ETA</p>
                    <p className="text-4xl font-mono font-bold text-amber-500">{formatTimeRemaining(calcResult.estimatedSeconds)}</p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold">Projected Arrival Date</p>
                    <p className="text-lg font-medium text-white">{calcResult.estimatedDate.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1 italic">Based on current network velocity</p>
                  </div>
                </div>
              ) : (
                <div className="mt-12 flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-3xl border border-dashed border-slate-700">
                  <i className="fa-solid fa-hourglass-start text-4xl text-slate-700 mb-4"></i>
                  <p className="text-slate-500">Enter a block number greater than <span className="text-amber-500 font-mono">#{stats.currentBlock}</span> to start calculation</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-500 text-center uppercase tracking-tighter">
                  Data sourced from Binance Smart Chain Public RPC
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-600 text-sm">
        <p>© {new Date().getFullYear()} BSC Block Sentinel • High Accuracy Node Polling • Built with React & Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
