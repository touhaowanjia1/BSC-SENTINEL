
export interface BlockData {
  number: number;
  timestamp: number;
}

export interface NetworkStats {
  currentBlock: number;
  avgBlockTime: number;
  history: BlockData[];
  lastUpdate: number;
}

export interface CalculationResult {
  targetBlock: number;
  blocksRemaining: number;
  estimatedSeconds: number;
  estimatedDate: Date;
}
