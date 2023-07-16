// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
  address public tokenAddress;

  constructor(address token) ERC20("TOKEN LP Token", "lpTKN") {
    require(token != address(0), "Token address cannot be 0");
    tokenAddress = token;
  }

  function getReserve() public view returns (uint256) {
    return ERC20(tokenAddress).balanceOf(address(this));
  }

  function addLiquidity(
    uint256 amountOfToken
  ) public payable returns (uint256) {
    uint256 lpTokensToMint;
    uint256 ethReserveBalance = address(this).balance;
    uint256 tokenReserveBalance = getReserve();

    ERC20 token = ERC20(tokenAddress);

    if (tokenReserveBalance == 0) {
      // Transfer the token from the user to the exchange.
      token.transferFrom(msg.sender, address(this), amountOfToken);

      // lpTokensToMint = ethReserveBalance = msg.value
      lpTokensToMint = ethReserveBalance;

      // Mint LP tokens to the user.
      _mint(msg.sender, lpTokensToMint);

      return lpTokensToMint;
    }

    // If the reserve is not empty, calculate the amount of LP Tokens to be minted.
    uint256 ethReservePriorToFunctionCall = ethReserveBalance - msg.value;
    uint256 minTokenAmountRequired = (msg.value * tokenReserveBalance) /
      ethReservePriorToFunctionCall;

    require(
      amountOfToken >= minTokenAmountRequired,
      "Insufficient amount of tokens provided"
    );

    // Transfer the token from the user to the exchange.
    token.transferFrom(msg.sender, address(this), minTokenAmountRequired);

    // Calculate the amount of LP tokens to be minted.
    lpTokensToMint =
      (totalSupply() * msg.value) /
      ethReservePriorToFunctionCall;

    // Mint LP tokens to the user.
    _mint(msg.sender, lpTokensToMint);

    return lpTokensToMint;
  }
}
