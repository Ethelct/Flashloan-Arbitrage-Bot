import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables
load_dotenv()
SEPOLIA_URL = os.getenv("Sepolia_Url")
PRIVATE_KEY = os.getenv("Private_Key")
WALLET_ADDRESS = os.getenv("Wallet")
CONTRACT_ADDRESS = os.getenv("Flashloan_Arbitrage")

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))
if not web3.is_connected():
    print("Failed to connect to Sepolia network")
    exit()

# FlashLoanArbitrage ABI (partial for withdraw function)
FLASHLOAN_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_tokenAddress", "type": "address"},
            {"name": "_amount", "type": "uint256"}
        ],
        "name": "withdraw",
        "outputs": [],
        "type": "function"
    }
]

# Initialize the contract
flashloan_contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=FLASHLOAN_ABI)

def withdraw_tokens(token_address, amount):
    try:
        print("Preparing withdrawal transaction...")

        # Estimate gas price and nonce
        gas_price = web3.eth.gas_price * 2  # Double the gas price
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS, 'pending')

        # Build transaction
        transaction = flashloan_contract.functions.withdraw(token_address, amount).build_transaction({
            'from': WALLET_ADDRESS,
            'gas': 150000,
            'gasPrice': gas_price,
            'nonce': nonce
        })

        # Sign and send transaction
        signed_txn = web3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)

        print(f"Withdrawal successful! Transaction hash: {web3.to_hex(tx_hash)}")
    except Exception as e:
        print(f"Error during withdrawal: {e}")

# Main function
def main():
    token_address = os.getenv("Sepolia_USDC")  # Example: USDC token address
    amount = int(1 * 10**6)  # Example: 1000 USDC (6 decimals)

    withdraw_tokens(token_address, amount)

if __name__ == "__main__":
    main()
