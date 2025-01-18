require('dotenv').config();
const { Web3 } = require('web3');

// Load environment variables
const PRIVATE_KEY = process.env.Private_Key;
const WALLET_ADDRESS = process.env.Wallet;
const CONTRACT_ADDRESS = process.env.Flashloan_Arbitrage;
const SEPOLIA_RPC_URL = process.env.Sepolia_Url;

// Initialize Web3
const web3 = new Web3(new Web3.providers.HttpProvider(SEPOLIA_RPC_URL));

// FlashLoanArbitrage ABI (partial for withdraw function)
const FLASHLOAN_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "_tokenAddress", "type": "address" },
            { "name": "_amount", "type": "uint256" }
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
    }
];

// Initialize contract instance
const flashloanContract = new web3.eth.Contract(FLASHLOAN_ABI, CONTRACT_ADDRESS);

async function withdrawTokens(tokenAddress, amount) {
    try {
        console.log("Preparing withdrawal transaction...");

        // Get the gas price and nonce
        const gasPrice = await web3.eth.getGasPrice();
        const increasedGasPrice = BigInt(gasPrice) * BigInt(2); // Use BigInt for handling gasPrice multiplication
        const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS, 'pending');

        // Build the transaction
        const tx = {
            from: WALLET_ADDRESS,
            to: CONTRACT_ADDRESS,
            data: flashloanContract.methods.withdraw(tokenAddress, amount).encodeABI(),
            gas: 150000,
            gasPrice: increasedGasPrice.toString(),
            nonce: nonce
        };

        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(`Withdrawal successful! Transaction hash: ${txReceipt.transactionHash}`);
    } catch (error) {
        console.error("Error during withdrawal:", error);
    }
}

// Main function
async function main() {
    const tokenAddress = process.env.Sepolia_USDC; // Example: USDC token address
    const amount = BigInt(100 * 10**6); // Example: 1000 USDC (6 decimals)

    await withdrawTokens(tokenAddress, amount);
}

main().catch(console.error);
