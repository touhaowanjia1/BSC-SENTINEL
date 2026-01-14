
import { BlockData } from '../types';

const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

export const fetchLatestBlock = async (): Promise<BlockData> => {
  try {
    const response = await fetch(BSC_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();
    const blockNumber = parseInt(data.result, 16);

    // To get the timestamp, we need to fetch the specific block
    const blockResponse = await fetch(BSC_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [data.result, false],
        id: 2,
      }),
    });

    const blockDetails = await blockResponse.json();
    const timestamp = parseInt(blockDetails.result.timestamp, 16);

    return {
      number: blockNumber,
      timestamp: timestamp,
    };
  } catch (error) {
    console.error('Error fetching BSC block:', error);
    throw error;
  }
};
