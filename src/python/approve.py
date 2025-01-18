import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables
load_dotenv()
SEPOLIA_URL = os.getenv("Sepolia_Url")
PRIVATE_KEY = os.getenv("Private_Key")
WALLET_ADDRESS = os.getenv("Wallet")
FLASHLOAN_ARBITRAGE_CONTRACT = os.getenv("Flashloan_Arbitrage")
DEX_ADDRESS = os.getenv("Dex")
USDC_ADDRESS = os.getenv("Sepolia_USDC")
DAI_ADDRESS = os.getenv("Sepolia_DAI")

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))
if not web3.is_connected():
    print("Failed to connect to Sepolia network")
    exit()

# ABI for the FlashLoanArbitrage contract
FLASHLOAN_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_tokenAddress", "type": "address"},
            {"name": "_spender", "type": "address"},
            {"name": "_amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    }
]

# Function to approve tokens
def approve_token(token_address, spender_address, amount):
    try:
        # Load FlashLoanArbitrage contract
        flashloan_contract = web3.eth.contract(address=FLASHLOAN_ARBITRAGE_CONTRACT, abi=FLASHLOAN_ABI)

        # Encode the function call
        data = flashloan_contract.functions.approve(token_address, spender_address, amount).build_transaction({
            'from': WALLET_ADDRESS
        })

        # Fetch current gas price
        gas_price = web3.eth.gas_price  # Get current gas price
        print(f"Using gas price: {gas_price}")

        # Estimate gas usage
        gas_estimate = web3.eth.estimate_gas({
            'from': WALLET_ADDRESS,
            'to': FLASHLOAN_ARBITRAGE_CONTRACT,
            'data': data['data']
        })
        print(f"Estimated gas: {gas_estimate}")

        # Get the nonce for the transaction
        nonce = web3.eth.get_transaction_count(WALLET_ADDRESS, 'pending')
        print(f"Nonce: {nonce}")

        # Build transaction
        tx = {
            'from': WALLET_ADDRESS,
            'to': FLASHLOAN_ARBITRAGE_CONTRACT,
            'data': data['data'],
            'gas': gas_estimate,
            'gasPrice': gas_price,
            'nonce': nonce
        }

        # Sign and send transaction
        signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        print(f"Approval successful! Transaction hash: {web3.to_hex(tx_hash)}")

    except Exception as e:
        print(f"Error in approving token: {e}")

# Approve USDC and DAI
usdc_approve_amount = int(3000 * 10**6)  # 3000 USDC (6 decimals)
dai_approve_amount = int(3000 * 10**18)  # 3000 DAI (18 decimals)

# Approve USDC for the DEX
approve_token(USDC_ADDRESS, DEX_ADDRESS, usdc_approve_amount)

# Approve DAI for the DEX
approve_token(DAI_ADDRESS, DEX_ADDRESS, dai_approve_amount)
