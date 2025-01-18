import os
import json
import time
from web3 import Web3
from dotenv import load_dotenv
import subprocess

# Load environment variables
load_dotenv()

MAINNET_URL = os.getenv("Mainnet_Url")
ETH_USDT_UNISWAP_V3 = os.getenv("Eth_USDT_UNISWAP_V3")
ETH_USDT_PANCAKESWAP_V3 = os.getenv("Eth_USDT_Pancakeswap_V3")

web3 = Web3(Web3.HTTPProvider(MAINNET_URL))

# Load ABIs
with open('abis/uniswap.json') as f:
    UniswapV3PoolABI = json.load(f)

with open('abis/pancakeswap.json') as f:
    PancakeSwapV3PoolABI = json.load(f)

def get_price(pool_address, abi):
    try:
        pool_contract = web3.eth.contract(address=pool_address, abi=abi)
        slot0 = pool_contract.functions.slot0().call()
        sqrt_price_x96 = slot0[0]
        
        # Calculate the price using the formula and 18 decimals
        price = (sqrt_price_x96 ** 2) / (2 ** 192) * (10 ** 12)
        return price
    except Exception as e:
        print(f"Error fetching price for pool {pool_address}: {e}")
        return None

def monitor_prices(threshold):
    while True:
        try:
            uniswap_price = get_price(ETH_USDT_UNISWAP_V3, UniswapV3PoolABI)
            pancakeswap_price = get_price(ETH_USDT_PANCAKESWAP_V3, PancakeSwapV3PoolABI)
            
            if uniswap_price and pancakeswap_price:
                print(f"Uniswap ETH/USDT Price: {uniswap_price:.4f} USDT")
                print(f"PancakeSwap ETH/USDT Price: {pancakeswap_price:.4f} USDT")
                price_difference = abs(uniswap_price - pancakeswap_price)
                print(f"Price Difference: {price_difference:.4f} USDT")
                
                if price_difference > threshold:
                    print(f"Price difference exceeds threshold of {threshold} USDT! Triggering flash loan...")

                    # Trigger flash loan by calling flashloan.py and stop monitoring
                    subprocess.run(["python", "flashloanarbitrage.py"])
                    print("Flash loan triggered. Stopping price monitoring.")
                    break  # Stop monitoring once flash loan is triggered
            else:
                print("Failed to fetch prices from one or both pools.")

        except Exception as e:
            print(f"Error in monitoring prices: {e}")
        
        time.sleep(1)  # Monitor every 1 seconds

# Start monitoring with a threshold of 5 USDT
if __name__ == "__main__":
    monitor_prices(threshold=5)
