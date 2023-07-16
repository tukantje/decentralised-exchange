import { expect } from "chai";
import hre from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

describe("Exchange", function () {
  it("Should be able to add liquidity to exchange", async function () {
    const token = await hre.ethers.deployContract("Token");
    await token.waitForDeployment();

    const exchange = await hre.ethers.deployContract("Exchange", [
      token.target,
    ]);
    await exchange.waitForDeployment();

    const [owner, alice] = await hre.ethers.getSigners();

    const transferTokenToAlice = await token
      .connect(owner)
      .transfer(alice, hre.ethers.parseEther("1"));
    await transferTokenToAlice.wait();

    await setBalance(alice.address, hre.ethers.parseEther("10"));

    const approvalTx = await token
      .connect(alice)
      .approve(exchange.target, hre.ethers.parseEther("1"));
    await approvalTx.wait();

    // Initial addition of liquidity
    const tx = await exchange
      .connect(alice)
      .addLiquidity(hre.ethers.parseEther("0.5"), {
        value: hre.ethers.parseEther("1"),
      });
    await tx.wait();

    expect(await token.balanceOf(exchange.target)).to.equal(
      hre.ethers.parseEther("0.5")
    );

    // Secondary addition of liquidity
    const secondTx = await exchange
      .connect(alice)
      .addLiquidity(hre.ethers.parseEther("0.5"), {
        value: hre.ethers.parseEther("1"),
      });
    await secondTx.wait();

    expect(await token.balanceOf(exchange.target)).to.equal(
      hre.ethers.parseEther("1")
    );
  });
});
