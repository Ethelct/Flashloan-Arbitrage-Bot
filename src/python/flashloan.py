import os
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SEPOLIA_URL = os.getenv("Sepolia_Url")
WALLET_ADDRESS = os.getenv("Wallet")
PRIVATE_KEY = os.getenv("Private_Key")
SMART_CONTRACT_ADDRESS = os.getenv("Smart_Contract")
USDT_ADDRESS = os.getenv("Sepolia_USDT")
USDC_ADDRESS = os.getenv("Sepolia_USDC")
SMART_CONTRACT_ADDRESS_2 = os.getenv("Smart_Contract_2")

# Flash Loan Contract ABI
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "_token", "type": "address"},
            {"internalType": "uint256", "name": "_amount", "type": "uint256"}
        ],
        "name": "fn_RequestFlashLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))

# Load smart contract
contract = web3.eth.contract(address=SMART_CONTRACT_ADDRESS, abi=CONTRACT_ABI)

def request_flash_loan(token_address, raw_amount):
    try:
        print(f"Requesting flash loan for {raw_amount} of token at {token_address}...")

        # Adjust amount for USDT/USDC (6 decimals)
        amount = raw_amount * 10**6
        
        # Get nonce for the transaction (to avoid duplicate transactions)
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)

        # Build transaction for the flash loan request
        transaction = contract.functions.fn_RequestFlashLoan(token_address, amount).build_transaction({
            'chainId': 11155111,  # Sepolia chain ID
            'gas': 300000,        # Set a gas limit
            'gasPrice': web3.to_wei('10', 'gwei'),  # Gas price in Gwei
            'nonce': nonce,
            'from': WALLET_ADDRESS
        })

        # Sign the transaction
        signed_txn = web3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)

        # Send the signed transaction
        tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)

        # Wait for the transaction receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"Transaction successful with hash: {tx_hash.hex()}")
        return receipt

    except Exception as e:
        print(f"Error triggering flash loan: {e}")

# Example usage: Request a flash loan for 1000 USDT or USDC
if __name__ == "__main__":
    TOKEN_ADDRESS = USDC_ADDRESS  # Change to USDT_ADDRESS as needed
    RAW_AMOUNT = 2000  # Example raw amount, 1000 USDT/USDC
    request_flash_loan(TOKEN_ADDRESS, RAW_AMOUNT)
