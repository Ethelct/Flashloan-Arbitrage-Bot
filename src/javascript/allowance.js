require('dotenv').config(); // Load environment variables
const { Web3 } = require('web3'); // Web3 setup

// Load environment variables
const SEPOLIA_URL = process.env.Sepolia_Url; // Sepolia network URL
const FLASHLOAN_ARBITRAGE_CONTRACT = process.env.Flashloan_Arbitrage; // Flashloan Arbitrage Smart Contract
const DEX_ADDRESS = process.env.Dex; // DEX address
const WALLET_ADDRESS = process.env.Wallet; // Wallet address

// ERC20 ABI for checking allowance
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [
            { "internalType": "address", "name": "_owner", "type": "address" },
            { "internalType": "address", "name": "_spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

// Connect to the Sepolia network
const web3 = new Web3(SEPOLIA_URL);

// Function to check allowance
async function checkAllowance(tokenAddress, spenderAddress) {
    try {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress);
        const allowance = await tokenContract.methods.allowance(FLASHLOAN_ARBITRAGE_CONTRACT, spenderAddress).call();
        console.log(`Allowance for spender ${spenderAddress} from ${FLASHLOAN_ARBITRAGE_CONTRACT} for token ${tokenAddress}: ${allowance}`);
    } catch (error) {
        console.error("Error checking allowance:", error.message);
    }
}

// Example usage: Check USDC and DAI allowance for the DEX
const USDC_ADDRESS = process.env.Sepolia_USDC;
const DAI_ADDRESS = process.env.Sepolia_DAI;

checkAllowance(USDC_ADDRESS, DEX_ADDRESS);
checkAllowance(DAI_ADDRESS, DEX_ADDRESS);
