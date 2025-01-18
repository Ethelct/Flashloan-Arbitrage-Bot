# Flash Loan Arbitrage Bot

## Overview

This project is a flash loan arbitrage bot designed to exploit price differences between decentralized exchanges (DEXs) using flash loans. The bot monitors price discrepancies and executes arbitrage opportunities by borrowing funds without collateral, conducting trades, and repaying the loan within the same transaction block.

## Folder Structure

```
flash-loan-arbitrage-bot/
|— contracts/
   |— Dex.sol
   |— Flashloan.sol
   |— FlashloanArbitrage.sol
|— src/
   |— python/
      |— getbalance.py
      |— withdraw.py
      |— approve.py
      |— allowance.py
      |— flashloan.py
      |— flashloanarbitrage.py
      |— monitor.py
   |— javascript/
      |— getbalance.js
      |— withdraw.js
      |— approve.js
      |— allowance.js
      |— flashloan.js
      |— flashloanarbitrage.js
      |— monitor.js
|— mainnet_integration/
   |— ethereumpools.json
|— .gitignore
|— README.md
```

## Contract Files

- **Dex.sol**: A simple DEX contract with 2 different reserves for the same contract. This is what we are going to exploit.
- **Flashloan.sol**: Takes a simple flash loan and repays it, plus the 0.09% fee.
- **FlashloanArbitrage.sol**: Contains the arbitrage logic, including the functions to execute the trades and repay the loan.

## Source Files

### Python
- **getbalance.py**: Retrieves the balance of specified tokens.
- **withdraw.py**: Withdraws tokens from the contract.
- **approve.py**: Approves a specified amount of tokens for trading.
- **allowance.py**: Checks the allowance of tokens.
- **flashloan.py**: Executes a flash loan.
- **flashloanarbitrage.py**: Conducts the arbitrage operation.
- **monitor.py**: Monitors price differences across DEXs.

### JavaScript
- **getbalance.js**: Retrieves the balance of specified tokens.
- **withdraw.js**: Withdraws tokens from the contract.
- **approve.js**: Approves a specified amount of tokens for trading.
- **allowance.js**: Checks the allowance of tokens.
- **flashloan.js**: Executes a flash loan.
- **flashloanarbitrage.js**: Conducts the flashloan arbitrage operation.
- **monitor.js**: Monitors price differences across DEXs.

## Mainnet Integration

- **ethereumpools.json**: Contains information about Ethereum liquidity pools for flash loans. To integrate the flashloan arbitrage logic to the mainnet, make sure you will monitor official pools from popular DEXes.

### Prerequisites

- Node.js and npm installed
- Python installed
- Solidity development environment (e.g., Hardhat, Truffle) (Or for simplicity deploy using Remix)

### Run the Bot

1. Deploy the contracts

2. Fund the contracts with some Sepolia USDT and Sepolia DAI (or any other coins you can get flash loan on and perform trades).

3. Call the approve functions (approve.js or approve.py) to approve the DEX contract to spend funds from your FlashloanArbitrage contract.

  ```bash
   node src/javascript/approve.js
   ```

4. Check if the approvals succeeded with (allowance.js or allowance.py).

  ```bash
   node src/javascript/allowance.js
   ```

5. Fund the DEX with SepoliaUSDT and SepoliaDAI to simulate liquidity.

6. Use getbalance.js or getbalance.py to check the balance of a token in a smart contract (both DEX and FlashloanArbitrage).

  ```bash
   node src/javascript/getbalance.js
   ```

7. Run monitor.js or monitor.py. This will start monitoring real time mainnet prices accross different DEXes.

  ```bash
   node src/javascript/monitor.js
   ```

8. After a specified threshold price, the bot will run FlashloanArbitrage.js (or FlashloanArbitrage.py accordingly) **ON THE SEPOLIA TESTNET, NOT ON MAINNET. THE ARBITRAGE OPERATION WILL BE PERFORMED ON THE DEX.SOL BUT BASED ON REAL TIME PRICE DATA**.

9. Withdraw the funds using withdraw.py or withdraw.js

  ```bash
   node src/javascript/withdraw.js
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

