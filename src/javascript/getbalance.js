require('dotenv').config(); // Load environment variables
const { Web3 } = require('web3'); // Web3 setup

// Load environment variables
const SEPOLIA_URL = process.env.Sepolia_Url; // Sepolia network URL
const FLASHLOAN_ARBITRAGE_CONTRACT = process.env.Flashloan_Arbitrage; // Flashloan Arbitrage Smart Contract

// ERC20 ABI for checking balance
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

// Connect to the Sepolia network
const web3 = new Web3(SEPOLIA_URL);

// Function to check token balance
async function checkBalance(tokenAddress) {
    try {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        const balance = await tokenContract.methods.balanceOf(FLASHLOAN_ARBITRAGE_CONTRACT).call();
        console.log(`Balance of token ${tokenAddress} in Flashloan Arbitrage Contract ${FLASHLOAN_ARBITRAGE_CONTRACT}: ${balance}`);
    } catch (error) {
        console.error("Error checking balance:", error.message);
    }
}

// Example usage: Check USDC and DAI balances in the Flashloan Arbitrage contract
const USDC_ADDRESS = process.env.Sepolia_USDC;
const DAI_ADDRESS = process.env.Sepolia_DAI;

checkBalance(USDC_ADDRESS);
checkBalance(DAI_ADDRESS);
