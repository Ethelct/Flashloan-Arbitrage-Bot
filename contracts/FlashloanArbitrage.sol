// contracts/FlashLoan.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";

interface IDex {
    function depositUSDC(uint256 _amount) external;
    function depositDAI(uint256 _amount) external;
    function buyDAI() external;
    function sellDAI() external;
}

contract FlashLoanArbitrage is FlashLoanSimpleReceiverBase {
    address payable owner;

    constructor(address _addressProvider)
        FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_addressProvider))
    {
        owner = payable(msg.sender);
    }

    /**
        This function is called after your contract has received the flash loaned amount.
        It's dynamically designed for arbitrage across tokens and DEXes.
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Decode dynamic parameters
        (
            address dexAddress,
            address tokenAAddress,
            address tokenBAddress,
            uint256 depositAmount
        ) = abi.decode(params, (address, address, address, uint256));

        // Initialize tokens and DEX contract
        IDex dexContract = IDex(dexAddress);
        IERC20 tokenA = IERC20(tokenAAddress);  // Example: USDC
        IERC20 tokenB = IERC20(tokenBAddress);  // Example: DAI

        // Approve tokenA for DEX operations
        tokenA.approve(dexAddress, depositAmount);

        // Execute arbitrage
        dexContract.depositUSDC(depositAmount);  // Assuming tokenA is USDC here
        dexContract.buyDAI();                    // Buy DAI (or tokenB)
        uint256 tokenBBalance = tokenB.balanceOf(address(this));
        dexContract.depositDAI(tokenBBalance);   // Deposit tokenB (like DAI)
        dexContract.sellDAI();                   // Sell tokenB to get tokenA (like USDC)

        // Repay flash loan + premium
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);

        return true;
    }

    /**
        Request a flash loan with dynamic DEX, tokens, and deposit amount.
     */
    function requestFlashLoan(
        address _token,             // Flash loan asset (tokenA)
        uint256 _amount,            // Flash loan amount
        address dexAddress,         // Address of the DEX
        address tokenAAddress,      // Address of tokenA (example: USDC)
        address tokenBAddress,      // Address of tokenB (example: DAI)
        uint256 depositAmount       // Amount to deposit in DEX
    ) public {
        address receiverAddress = address(this);
        bytes memory params = abi.encode(dexAddress, tokenAAddress, tokenBAddress, depositAmount);
        uint16 referralCode = 0;

        POOL.flashLoanSimple(
            receiverAddress,
            _token,
            _amount,
            params,
            referralCode
        );
    }

    /**
        Approve dynamic token for a specific spender and amount.
     */
    function approve(address _tokenAddress, address _spender, uint256 _amount) external returns (bool) {
        IERC20 token = IERC20(_tokenAddress);
        return token.approve(_spender, _amount);
    }

    /**
        Get allowance for a dynamic token and spender.
     */
    function allowance(address _tokenAddress, address _owner, address _spender) external view returns (uint256) {
        IERC20 token = IERC20(_tokenAddress);
        return token.allowance(_owner, _spender);
    }

    /**
        Dynamic withdrawal for a specified amount of a token.
     */
    function withdraw(address _tokenAddress, uint256 _amount) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        require(token.balanceOf(address(this)) >= _amount, "Insufficient balance");
        token.transfer(msg.sender, _amount);
    }

    /**
        Check token balance.
     */
    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    receive() external payable {}
}
