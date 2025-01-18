require("dotenv").config();
const { Web3 } = require("web3");

// Load environment variables
const PRIVATE_KEY = process.env.Private_Key;
const WALLET_ADDRESS = process.env.Wallet;
const FLASHLOAN_CONTRACT_ADDRESS = process.env.Flashloan_Arbitrage;
const SEPOLIA_RPC_URL = process.env.Sepolia_Url;
const DEX_ADDRESS = process.env.Dex;
const USDC_ADDRESS = process.env.Sepolia_USDC;
const DAI_ADDRESS = process.env.Sepolia_DAI;

// Initialize Web3
const web3 = new Web3(new Web3.providers.HttpProvider(SEPOLIA_RPC_URL));

// FlashLoanArbitrage Contract ABI
const FLASHLOAN_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_token", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "dexAddress", type: "address" },
      { name: "tokenAAddress", type: "address" },
      { name: "tokenBAddress", type: "address" },
      { name: "depositAmount", type: "uint256" },
    ],
    name: "requestFlashLoan",
    outputs: [],
    type: "function",
  },
];

// FlashLoanArbitrage Contract Instance
const flashloanContract = new web3.eth.Contract(
  FLASHLOAN_ABI,
  FLASHLOAN_CONTRACT_ADDRESS
);

// Function to send a transaction with timeout
const sendTransactionWithTimeout = (rawTransaction, timeout) => {
  return Promise.race([
    web3.eth.sendSignedTransaction(rawTransaction),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Transaction timeout")), timeout)
    ),
  ]);
};

// Main function to request a flash loan
async function requestFlashLoan() {
  try {
    console.log("Preparing transaction to request flash loan...");

    // Define parameters
    const tokenA = USDC_ADDRESS; // USDC
    const tokenB = DAI_ADDRESS; // DAI
    const dexAddress = DEX_ADDRESS; // DEX contract address
    const flashLoanAmount = web3.utils.toWei("1000", "mwei"); // 1000 USDC (6 decimals)
    const depositAmount = flashLoanAmount; // Same as flash loan amount

    console.log(`Token A (USDC): ${tokenA}`);
    console.log(`Token B (DAI): ${tokenB}`);
    console.log(`DEX Address: ${dexAddress}`);
    console.log(`Flash Loan Amount: ${flashLoanAmount}`);
    console.log(`Deposit Amount: ${depositAmount}`);

    // Build transaction data
    const data = flashloanContract.methods
      .requestFlashLoan(tokenA, flashLoanAmount, dexAddress, tokenA, tokenB, depositAmount)
      .encodeABI();

    // Fetch gas price, gas estimate, and nonce
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
      from: WALLET_ADDRESS,
      to: FLASHLOAN_CONTRACT_ADDRESS,
      data: data,
    });
    const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS, "pending");

    console.log(`Gas Price: ${gasPrice}`);
    console.log(`Gas Estimate: ${gasEstimate}`);
    console.log(`Nonce: ${nonce}`);

    // Build transaction
    const tx = {
      from: WALLET_ADDRESS,
      to: FLASHLOAN_CONTRACT_ADDRESS,
      data: data,
      gas: gasEstimate,
      gasPrice: gasPrice,
      nonce: nonce,
    };

    // Sign the transaction
    console.log("Signing the transaction...");
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

    console.log("Sending the transaction...");

    // Send the transaction with a timeout
    const receipt = await sendTransactionWithTimeout(signedTx.rawTransaction, 30000); // 30s timeout

    console.log("Flash loan request successful!");
    console.log(`Transaction Hash: ${receipt.transactionHash}`);
    console.log("Transaction Receipt:", receipt);
  } catch (error) {
    console.error("Error while sending the transaction:", error);
  }
}

// Execute the function
requestFlashLoan();
