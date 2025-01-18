import os
import time
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables
load_dotenv()
SEPOLIA_URL = os.getenv("Sepolia_Url")
PRIVATE_KEY = os.getenv("Private_Key")
WALLET_ADDRESS = os.getenv("Wallet")
CONTRACT_ADDRESS = os.getenv("Flashloan_Arbitrage")
DEX_ADDRESS = os.getenv("Dex")
USDC_ADDRESS = os.getenv("Sepolia_USDC")
DAI_ADDRESS = os.getenv("Sepolia_DAI")

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))
if not web3.is_connected():
    print("Failed to connect to Sepolia network")
    exit()

# FlashLoanArbitrage ABI (partial for flash loan and approve functions)
FLASHLOAN_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_token", "type": "address"},
            {"name": "_amount", "type": "uint256"},
            {"name": "dexAddress", "type": "address"},
            {"name": "tokenAAddress", "type": "address"},
            {"name": "tokenBAddress", "type": "address"},
            {"name": "depositAmount", "type": "uint256"}
        ],
        "name": "requestFlashLoan",
        "outputs": [],
        "type": "function"
    }
]

# Initialize contract instance
flashloan_contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=FLASHLOAN_ABI)

def request_flash_loan(token_address, amount, dex_address, token_a, token_b, deposit_amount):
    try:
        print("Preparing transaction to request flash loan...")

        # Encode transaction data
        transaction_data = flashloan_contract.functions.requestFlashLoan(
            token_address,
            amount,
            dex_address,
            token_a,
            token_b,
            deposit_amount
        ).build_transaction({
            'from': WALLET_ADDRESS
        })

        # Log the transaction data
        print(f"Transaction Data: {transaction_data['data']}")

        # Fetch gas price and nonce
        gas_price = web3.eth.gas_price
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS, 'pending')

        # Estimate gas dynamically
        gas_estimate = flashloan_contract.functions.requestFlashLoan(
            token_address, amount, dex_address, token_a, token_b, deposit_amount
        ).estimate_gas({'from': WALLET_ADDRESS})

        print(f"Gas Price: {gas_price}")
        print(f"Gas Estimate: {gas_estimate}")
        print(f"Nonce: {nonce}")

        # Build transaction
        tx = {
            'from': WALLET_ADDRESS,
            'to': CONTRACT_ADDRESS,
            'data': transaction_data['data'],
            'gas': gas_estimate,
            'gasPrice': gas_price,
            'nonce': nonce
        }

        print("Signing the transaction...")

        # Sign the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)

        print("Sending the transaction...")

        # Send transaction
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

        print(f"Transaction sent! Hash: {web3.to_hex(tx_hash)}")

        # Wait for receipt with a longer timeout
        print("Waiting for transaction receipt...")
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=600)  # 10-minute timeout

        if tx_receipt.status == 1:
            print("Flash loan arbitrage transaction successful!")
        else:
            print("Flash loan arbitrage transaction failed!")

    except Exception as e:
        print("Error during flash loan request:")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")

# Main function
if __name__ == "__main__":
    # Flash loan parameters
    flash_loan_amount = web3.to_wei("1000", "mwei")  # 1000 USDC (6 decimals)
    deposit_amount = flash_loan_amount  # Same as flash loan amount

    request_flash_loan(
        token_address=USDC_ADDRESS,
        amount=flash_loan_amount,
        dex_address=DEX_ADDRESS,
        token_a=USDC_ADDRESS,
        token_b=DAI_ADDRESS,
        deposit_amount=deposit_amount
    )