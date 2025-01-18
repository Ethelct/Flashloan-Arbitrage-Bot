import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment variables
load_dotenv()
SEPOLIA_URL = os.getenv("Sepolia_Url")
FLASHLOAN_ARBITRAGE_CONTRACT = os.getenv("Flashloan_Arbitrage")
DEX_ADDRESS = os.getenv("Dex")
USDC_ADDRESS = os.getenv("Sepolia_USDC")
DAI_ADDRESS = os.getenv("Sepolia_DAI")

# Connect to Sepolia network
web3 = Web3(Web3.HTTPProvider(SEPOLIA_URL))
if not web3.is_connected():
    print("Failed to connect to Sepolia network")
    exit()

# ERC20 ABI for allowance function
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]

def check_allowance(token_address, spender_address):
    try:
        # Load token contract
        token_contract = web3.eth.contract(address=token_address, abi=ERC20_ABI)

        # Call allowance function
        allowance = token_contract.functions.allowance(
            FLASHLOAN_ARBITRAGE_CONTRACT, spender_address
        ).call()
        print(f"Allowance for spender {spender_address} on token {token_address}: {allowance}")
    except Exception as e:
        print(f"Error in checking allowance: {e}")

# Check allowances for USDC and DAI
check_allowance(USDC_ADDRESS, DEX_ADDRESS)
check_allowance(DAI_ADDRESS, DEX_ADDRESS)
