import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables
load_dotenv()
SEPOLIA_URL = os.getenv("Sepolia_Url")
FLASHLOAN_ARBITRAGE_CONTRACT = os.getenv("Flashloan_Arbitrage")
USDC_ADDRESS = os.getenv("Sepolia_USDC")
DAI_ADDRESS = os.getenv("Sepolia_DAI")

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))
if not web3.is_connected():
    print("Failed to connect to Sepolia network")
    exit()

# ERC20 ABI for balanceOf function
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]

def check_balance(token_address):
    try:
        # Load token contract
        token_contract = web3.eth.contract(address=token_address, abi=ERC20_ABI)

        # Call balanceOf function
        balance = token_contract.functions.balanceOf(
            FLASHLOAN_ARBITRAGE_CONTRACT
        ).call()
        print(f"Balance of token {token_address}: {balance}")
    except Exception as e:
        print(f"Error in checking balance: {e}")

# Check balances for USDC and DAI
check_balance(USDC_ADDRESS)
check_balance(DAI_ADDRESS)
