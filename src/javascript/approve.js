require('dotenv').config();
const {Web3} = require('web3');

// Load environment variables
const PRIVATE_KEY = process.env.Private_Key;
const WALLET_ADDRESS = process.env.Wallet;
const DEX_ADDRESS = process.env.Dex;
const CONTRACT_ADDRESS = process.env.Flashloan_Arbitrage;
const SEPOLIA_RPC_URL = process.env.Sepolia_Url;
const USDC_ADDRESS = process.env.Sepolia_USDC;
const DAI_ADDRESS = process.env.Sepolia_DAI;

// Initialize Web3
const web3 = new Web3(new Web3.providers.HttpProvider(SEPOLIA_RPC_URL));

// Load the FlashLoanArbitrage ABI
const FLASHLOAN_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_tokenAddress", "type": "address" },
      { "name": "_spender", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

// Initialize contract instance
const flashLoanContract = new web3.eth.Contract(FLASHLOAN_ABI, CONTRACT_ADDRESS);

// Function to send a transaction
async function approveToken(tokenAddress, spender, amount) {
  console.log(`Approving ${amount} of token ${tokenAddress} for spender ${spender}...`);

  try {
    // Prepare the transaction data
    const data = flashLoanContract.methods
      .approve(tokenAddress, spender, amount)
      .encodeABI();

    // Get the gas price and gas estimate
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await web3.eth.estimateGas({
      from: WALLET_ADDRESS,
      to: CONTRACT_ADDRESS,
      data: data
    });

    // Create the transaction
    const tx = {
      from: WALLET_ADDRESS,
      to: CONTRACT_ADDRESS,
      data: data,
      gas: gasEstimate,
      gasPrice: gasPrice
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);

    // Send the signed transaction
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log(`Approval successful! Transaction hash: ${receipt.transactionHash}`);
  } catch (error) {
    console.error("Error during approval:", error);
  }
}

// Main function to approve USDC and DAI
async function main() {
    // Approve amounts
    const usdcApproveAmount = web3.utils.toWei("2000", "mwei"); // 1000 USDC (6 decimals)
    const daiApproveAmount = web3.utils.toWei("2000", "ether"); // 1000 DAI (18 decimals)
  
    // Approve USDC for the DEX
    await approveToken(USDC_ADDRESS, DEX_ADDRESS, usdcApproveAmount);
  
    // Approve DAI for the DEX
    await approveToken(DAI_ADDRESS, DEX_ADDRESS, daiApproveAmount);
  }
  

// Run the script
main().catch((error) => {
  console.error("Error in script execution:", error);
});
