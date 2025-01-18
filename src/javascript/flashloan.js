require('dotenv').config(); // Load environment variables
const {Web3} = require('web3');

// Load environment variables from .env file
const SEPOLIA_URL = process.env.Sepolia_Url; // Sepolia network URL
const WALLET_ADDRESS = process.env.Wallet; // Wallet address
const PRIVATE_KEY = process.env.Private_Key; // Private key
const SMART_CONTRACT_ADDRESS = process.env.Smart_Contract; // Flash Loan Smart Contract address
const USDT_ADDRESS = process.env.Sepolia_USDT; // USDT contract address
const USDC_ADDRESS = process.env.Sepolia_USDC; // USDC contract address
const SMART_CONTRACT_ADDRESS_2 = process.env.Smart_Contract_2;

// Flash Loan Contract ABI
const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "_token", "type": "address" },
            { "internalType": "uint256", "name": "_amount", "type": "uint256" }
        ],
        "name": "fn_RequestFlashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Connect to the Sepolia network
const web3 = new Web3(SEPOLIA_URL);

// Load the smart contract
const contract = new web3.eth.Contract(CONTRACT_ABI, SMART_CONTRACT_ADDRESS_2);

// Function to trigger the flash loan
async function requestFlashLoan(tokenAddress, rawAmount) {
    try {
        console.log(`Requesting flash loan for ${rawAmount} of token at ${tokenAddress}...`);

        // Since USDT and USDC have 6 decimals, multiply rawAmount by 10^6
        const amount = rawAmount * (10 ** 6);
        
        const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS, 'latest'); // Get the nonce

        // Build transaction
        const tx = {
            from: WALLET_ADDRESS,
            to: SMART_CONTRACT_ADDRESS_2,
            gas: 300000, // Adjust gas limit based on your contract's complexity
            gasPrice: web3.utils.toWei('10', 'gwei'), // Adjust gas price
            data: contract.methods.fn_RequestFlashLoan(tokenAddress, amount).encodeABI(),
            nonce: nonce
        };

        // Sign the transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

        // Send the transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction successful! Hash: ${receipt.transactionHash}`);
    } catch (error) {
        console.error("Error during flash loan request:", error.message);
    }
}

// Example Usage: Request a flash loan for 1000 USDT or USDC
const TOKEN_ADDRESS = USDT_ADDRESS; // Change to `USDC_ADDRESS` or `USDT_ADDRESS` as needed
const RAW_AMOUNT = 2000; // The raw amount, e.g., 1000 USDT/USDC (before adjusting for decimals)

requestFlashLoan(TOKEN_ADDRESS, RAW_AMOUNT);
