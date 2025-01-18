require('dotenv').config();
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Load ABIs
const UniswapV3PoolABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abis/uniswap.json')));
const PancakeSwapV3PoolABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'abis/pancakeswap.json')));

// Load environment variables
const MAINNET_URL = process.env.Mainnet_Url;
const POOLS = JSON.parse(fs.readFileSync(path.join(__dirname, 'ethereumpools.json'))); // Dynamic pool configuration file

const web3 = new Web3(MAINNET_URL);

// Fetch slot0 and calculate the price for a pool
async function getPrice(poolAddress, abi) {
    try {
        const poolContract = new web3.eth.Contract(abi, poolAddress);
        const slot0 = await poolContract.methods.slot0().call();
        const sqrtPriceX96 = BigInt(slot0[0]);

        const numerator = sqrtPriceX96 * sqrtPriceX96;
        const denominator = BigInt(2) ** BigInt(192);
        const price = (Number(numerator) / Number(denominator)) * 10 ** 12; // Adjust for decimals

        return price;
    } catch (error) {
        console.error(`Error fetching price for pool at ${poolAddress}:`, error.message);
        return null;
    }
}

// Monitor prices for multiple pools and calculate spreads
async function monitorPrices() {
    const prices = {};

    try {
        // Fetch prices for all pools
        for (const pool of POOLS) {
            const abi = pool.type === 'uniswap-v3' ? UniswapV3PoolABI : PancakeSwapV3PoolABI;
            const price = await getPrice(pool.address, abi);

            if (price) {
                prices[pool.name] = price;
                console.log(`${pool.name} Price: ${price.toFixed(4)} USDT`);
            } else {
                console.error(`Failed to fetch price for ${pool.name}`);
            }
        }

        // Calculate spreads between pools
        const poolNames = Object.keys(prices);
        for (let i = 0; i < poolNames.length; i++) {
            for (let j = i + 1; j < poolNames.length; j++) {
                const spread = Math.abs(prices[poolNames[i]] - prices[poolNames[j]]);
                console.log(`Spread between ${poolNames[i]} and ${poolNames[j]}: ${spread.toFixed(4)} USDT`);

                // Check for arbitrage opportunities
                const THRESHOLD = 5; // Threshold to trigger arbitrage
                if (spread > THRESHOLD) {
                    console.log(`Arbitrage opportunity detected between ${poolNames[i]} and ${poolNames[j]}!`);

                    // Trigger the flashloan script
                    exec('node flashloanarbitrage.js', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error executing flashloan script: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`Flashloan executed successfully: ${stdout}`);
                    });

                    // Stop monitoring after executing flashloan (optional)
                    return;
                }
            }
        }
    } catch (error) {
        console.error('Error monitoring prices:', error.message);
    }
}

// Monitor pending transactions and simulate price impact
async function monitorPendingTransactions() {
    // Access mempool transactions (requires node with mempool access)
    const subscription = web3.eth.subscribe('pendingTransactions', async (error, txHash) => {
        if (error) {
            console.error('Error subscribing to pending transactions:', error);
            return;
        }

        try {
            const transaction = await web3.eth.getTransaction(txHash);
            if (transaction && transaction.to) {
                const pool = POOLS.find(p => p.address.toLowerCase() === transaction.to.toLowerCase());
                if (pool) {
                    console.log(`Pending transaction detected in ${pool.name}:`, transaction);

                    // Simulate price impact
                    const priceImpact = await simulatePriceImpact(pool, transaction);
                    console.log(`Simulated price impact in ${pool.name}: ${priceImpact.toFixed(4)} USDT`);

                    // Check if this creates an arbitrage opportunity
                    if (priceImpact > 5) {
                        console.log(`Arbitrage opportunity from pending transaction in ${pool.name}`);
                        // Add logic to execute flashloan
                    }
                }
            }
        } catch (err) {
            console.error('Error processing pending transaction:', err.message);
        }
    });

    return subscription;
}

// Simulate the price impact of a transaction on a pool
async function simulatePriceImpact(pool, transaction) {
    try {
        // Decode transaction data to determine token amounts and direction
        const decodedData = web3.eth.abi.decodeParameters(['uint256'], transaction.input);
        const amount = BigInt(decodedData[0]);

        // Simulate price impact (simple model, adjust as needed for pool mechanics)
        const currentPrice = await getPrice(pool.address, pool.type === 'uniswap-v3' ? UniswapV3PoolABI : PancakeSwapV3PoolABI);
        const adjustedPrice = currentPrice + Number(amount) * 0.0001; // Example impact factor

        return adjustedPrice - currentPrice;
    } catch (error) {
        console.error('Error simulating price impact:', error.message);
        return 0;
    }
}

// Start monitoring
(async () => {
    console.log("Starting pool monitoring...");

    // Monitor prices every second
    setInterval(monitorPrices, 1000);

    // Monitor pending transactions
    monitorPendingTransactions();
})();
